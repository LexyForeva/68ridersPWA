export default function Logo({ compact = false }) {
  return <div className="logo-wrap">
    <div className="logo-mark">68</div>
    <div>
      <div className={compact ? 'logo-text compact' : 'logo-text'}>RIDERS</div>
      <div className="logo-sub">AKSARAY MOTORCYCLE COMMUNITY</div>
    </div>
  </div>
}
