import { useRef, useState } from 'react'
import { Eye, ImagePlus, PlayCircle, SlidersHorizontal } from 'lucide-react'
import Modal from '../components/Modal'
import MotoImage from '../components/MotoImage'
import { useAppData } from '../context/AppContext'

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Gallery() {
  const { gallery, addGalleryItem, notify } = useAppData()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', src: '', type: 'photo' })
  const uploadInputRef = useRef(null)

  const visibleGallery =
    activeFilter === 'all' ? gallery : gallery.filter((item) => item.type === activeFilter)

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isImage && !isVideo) {
      notify('Galeri için fotoğraf veya video dosyası seç.', 'warning')
      return
    }

    const src = await readFileAsDataUrl(file)
    setUploadForm((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^.]+$/, ''),
      src,
      type: isVideo ? 'video' : 'photo',
    }))
    event.target.value = ''
  }

  const submitUpload = (event) => {
    event.preventDefault()
    if (!uploadForm.src) {
      notify('Önce medya dosyası seçmelisin.', 'warning')
      return
    }

    addGalleryItem({
      title: uploadForm.title || (uploadForm.type === 'video' ? 'Yeni video' : 'Yeni fotoğraf'),
      type: uploadForm.type,
      image: 'ride',
      src: uploadForm.src,
    })
    setUploadForm({ title: '', src: '', type: 'photo' })
    setUploadOpen(false)
    setActiveFilter('all')
  }

  return (
    <section className="screen page">
      <div className="titlebar">
        <h1>Galeri</h1>
        <div className="head-actions">
          <button className="icon-btn" type="button" onClick={() => setUploadOpen(true)} aria-label="Medya ekle">
            <ImagePlus size={18} />
          </button>
          <button className="icon-btn" type="button" aria-label="Galeri filtresi">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="tabs center">
        <button
          type="button"
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          Tümü
        </button>
        <button
          type="button"
          className={activeFilter === 'photo' ? 'active' : ''}
          onClick={() => setActiveFilter('photo')}
        >
          Fotoğraflar
        </button>
        <button
          type="button"
          className={activeFilter === 'video' ? 'active' : ''}
          onClick={() => setActiveFilter('video')}
        >
          Videolar
        </button>
      </div>

      <div className="gallery-grid real">
        {visibleGallery.map((item) => (
          <button
            type="button"
            key={item.id}
            className="gallery-item real"
            onClick={() => setSelectedItem(item)}
            aria-label={`${item.title} görüntüle`}
          >
            <GalleryThumb item={item} />
            {item.type === 'video' && <PlayCircle className="play" />}
          </button>
        ))}
      </div>

      {uploadOpen && (
        <Modal title="Medya Ekle" onClose={() => setUploadOpen(false)}>
          <form className="modal-form" onSubmit={submitUpload}>
            <label className="field">
              <span>Başlık</span>
              <input
                value={uploadForm.title}
                onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Örn. Yeni rota medyası"
              />
            </label>
            <button className="upload-drop" type="button" onClick={() => uploadInputRef.current?.click()}>
              {uploadForm.src ? <UploadPreview form={uploadForm} /> : <ImagePlus size={32} />}
              <span>{uploadForm.src ? (uploadForm.type === 'video' ? 'Video seçildi' : 'Fotoğraf seçildi') : 'Fotoğraf veya video seç'}</span>
            </button>
            <input ref={uploadInputRef} className="sr-only" type="file" accept="image/*,video/*" onChange={chooseFile} />
            <button type="submit" className="primary-btn">
              Galeriye Ekle
            </button>
          </form>
        </Modal>
      )}

      {selectedItem && (
        <Modal title={selectedItem.title} onClose={() => setSelectedItem(null)} className="media-modal">
          {selectedItem.type === 'video' && selectedItem.src ? (
            <video className="media-photo" src={selectedItem.src} controls playsInline />
          ) : selectedItem.type === 'video' ? (
            <div className="video-demo">
              <PlayCircle size={58} />
              <b>Demo video oynatılıyor</b>
              <span>68 Riders medya arşivi · 00:42</span>
            </div>
          ) : selectedItem.src ? (
            <img className="media-photo" src={selectedItem.src} alt={selectedItem.title} />
          ) : (
            <MotoImage type={selectedItem.image} label={selectedItem.title} />
          )}
          <div className="media-meta">
            <span>{selectedItem.type === 'video' ? 'Video' : 'Fotoğraf'}</span>
            <span>
              <Eye size={14} /> {selectedItem.views}
            </span>
          </div>
        </Modal>
      )}
    </section>
  )
}

function GalleryThumb({ item }) {
  if (item.src) {
    return (
      <>
        {item.type === 'video' ? (
          <video className="gallery-photo" src={item.src} muted playsInline preload="metadata" />
        ) : (
          <img className="gallery-photo" src={item.src} alt="" />
        )}
        <span>{item.title}</span>
      </>
    )
  }

  return <MotoImage type={item.image} label={item.title} />
}

function UploadPreview({ form }) {
  if (form.type === 'video') return <video src={form.src} muted playsInline preload="metadata" />
  return <img src={form.src} alt="Seçilen medya" />
}
