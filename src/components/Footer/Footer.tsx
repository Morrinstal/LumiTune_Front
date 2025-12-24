import './Footer.css'
import logo from '../../assets/Footer/logo_big.svg'
import pin from '../../assets/Footer/pin.svg'
import phone from '../../assets/Footer/phone.svg'
import mail from '../../assets/Footer/mail.svg'
import fb_logo from '../../assets/Footer/fb_logo.svg'
import tw_logo from '../../assets/Footer/tw_logo.svg'
import pint_logo from '../../assets/Footer/pint_logo.svg'
import rss_logo from '../../assets/Footer/rss_logo.svg'

function Footer() {
    return (
    <footer className='mainPageFooter'>
        <div className='footerInner'>
            <div className='footerTop'>
                <a href='/' className='footerBrand' aria-label='LumiTune — на головну'>
                    <img src={logo} alt='logo image' />
                </a>

                <div className='footerContacts'>
                    <ul className='footerContactsList'>
                        <li className='footerContactsItem'>
                            <img src={pin} alt='' />
                            <address className='footerItemText'>Adress st. Shevchenko, 25 house, UA, Odessa, 00000</address>
                        </li>

                        <li className='footerContactsItem'>
                            <img src={phone} alt='' />
                            <span className='footerItemText'>(380) 00-000-00-00</span>
                        </li>

                        <li className='footerContactsItem'>
                            <img src={mail} alt='' />
                            <span className='footerItemText'>lumitune@gmail.com</span>
                        </li>
                    </ul>
                    
                    <ul className='footerSocialList'>
                        <li>
                            <a href='#' className='footerSocialLink'>
                                <img src={fb_logo} alt='' />
                            </a>
                        </li>

                        <li>
                            <a href='#' className='footerSocialLink'>
                                <img src={tw_logo} alt='' />
                            </a>
                        </li>

                        <li>
                            <a href='#' className='footerSocialLink'>
                                <img src={pint_logo} alt='' />
                            </a>
                        </li>

                        <li>
                            <a href='#' className='footerSocialLink'>
                                <img src={rss_logo} alt='' />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr className='footerDivider' />

            <div className='footerBottom'>
                <ul className='footerLinks'>
                    <li><a href='#' className='footerLinkText'>About us</a></li>
                    <li><a href='#' className='footerLinkText'>Contact us</a></li>
                    <li><a href='#' className='footerLinkText'>Help</a></li>
                    <li><a href='#' className='footerLinkText'>Privacy Policy</a></li>
                    <li><a href='#' className='footerLinkText'>Disclaimer</a></li>
                </ul>
            </div>
        </div>
    </footer>
    );
}

export default Footer;