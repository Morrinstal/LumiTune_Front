import './NavItem.css';

type NavItemProps = {
  iconSrc: string;
  title:   string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function NavItem({ iconSrc, title, active=false, onClick, disabled=false }: NavItemProps) {
  return (
    <div className={`navItemBlock ${active ? 'is-active' : ''}`}>
      <button
        type="button"
        className="navItemBtn"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        aria-label={title}
      >
        <img src={iconSrc} className="iconSrc" alt="" aria-hidden="true" />
        <span className="navItemTitle">{title}</span>
      </button>
    </div>
  );
}

export default NavItem;
