export default function ToolsScreen({ isPremium, onBack, onOpenTuner, onOpenMetronome, onOpenStrum, onUpgrade, onCloudSync }) {
  const tools = [
    {
      key: 'tuner',
      icon: '🎸',
      title: 'Afinador',
      desc: 'Afine seu instrumento com precisão pelo microfone.',
      badge: 'Grátis',
      badgeClass: 'tools-badge-free',
      onClick: onOpenTuner,
    },
    {
      key: 'metronome',
      icon: '⏱️',
      title: 'Metrônomo',
      desc: 'Marque o tempo dos seus ensaios com clareza.',
      badge: 'Grátis',
      badgeClass: 'tools-badge-free',
      onClick: onOpenMetronome,
    },
    {
      key: 'strum',
      icon: '🥁',
      title: 'Batida',
      desc: 'Barra de batida visual para acompanhar o ritmo.',
      badge: 'Grátis',
      badgeClass: 'tools-badge-free',
      onClick: onOpenStrum,
    },
    {
      key: 'cloud',
      icon: '☁️',
      title: 'Backup na nuvem',
      desc: 'Sincronize seu repertório entre todos os dispositivos.',
      badge: 'Premium',
      badgeClass: 'tools-badge-premium',
      premium: true,
      onClick: () => (isPremium ? onCloudSync?.() : onUpgrade?.('cloud')),
    },
    {
      key: 'stage',
      icon: '🎤',
      title: 'Modo palco',
      desc: 'Rolagem automática e apresentação em tela cheia.',
      badge: 'Premium',
      badgeClass: 'tools-badge-premium',
      premium: true,
      onClick: () => onUpgrade?.('advanced'),
    },
    {
      key: 'transpose',
      icon: '🎚️',
      title: 'Transposição avançada',
      desc: 'Mude o tom com um toque, direto na cifra.',
      badge: 'Grátis',
      badgeClass: 'tools-badge-free',
      hint: 'Abra qualquer música para usar.',
      onClick: null,
    },
  ]

  return (
    <>
      <div className="topbar">
        <button className="tbtn" onClick={onBack} aria-label="Voltar">←</button>
        <div className="topbar-title">Ferramentas</div>
        <div style={{width:36}} />
      </div>
      <div id="content" className="tools-screen-content">
        <div className="tools-wrap">
          <header className="tools-hero">
            <div className="tools-hero-eyebrow">Utilidades musicais</div>
            <h2 className="tools-hero-title">Tudo o que você precisa para tocar</h2>
            <p className="tools-hero-sub">
              Afinador, metrônomo e recursos de palco reunidos em um só lugar — feitos para ensaio, culto e show.
            </p>
          </header>

          <section className="tools-grid" aria-label="Ferramentas disponíveis">
            {tools.map(t => {
              const clickable = !!t.onClick
              const Tag = clickable ? 'button' : 'div'
              return (
                <Tag
                  key={t.key}
                  type={clickable ? 'button' : undefined}
                  className={`tools-card${t.premium ? ' tools-card-premium' : ''}${!clickable ? ' tools-card-static' : ''}`}
                  onClick={clickable ? t.onClick : undefined}
                >
                  <div className="tools-card-head">
                    <span className="tools-card-icon" aria-hidden="true">{t.icon}</span>
                    <span className={`tools-badge ${t.badgeClass}`}>{t.badge}</span>
                  </div>
                  <div className="tools-card-body">
                    <strong className="tools-card-title">{t.title}</strong>
                    <span className="tools-card-desc">{t.desc}</span>
                    {t.hint && <span className="tools-card-hint">{t.hint}</span>}
                  </div>
                  {clickable && (
                    <span className="tools-card-cta" aria-hidden="true">
                      {t.premium && !isPremium ? 'Desbloquear' : 'Abrir'} ›
                    </span>
                  )}
                </Tag>
              )
            })}
          </section>

          {!isPremium && (
            <section className="tools-upsell">
              <div className="tools-upsell-inner">
                <div className="tools-upsell-icon">👑</div>
                <div className="tools-upsell-text">
                  <strong>Libere todas as ferramentas Premium</strong>
                  <span>Backup na nuvem, modo palco e novidades em primeira mão.</span>
                </div>
                <button className="tools-upsell-cta" onClick={() => onUpgrade?.('generic')}>
                  Conhecer Premium
                </button>
              </div>
            </section>
          )}

          <div className="tools-footer-note">Mais ferramentas em breve · sugira em Suporte</div>
        </div>
      </div>
    </>
  )
}
