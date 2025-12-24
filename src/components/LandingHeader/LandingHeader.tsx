import './LandingHeader.css'
import logo from '../../assets/logo.svg'
import { Link } from 'react-router-dom';

function Header() {

    return (
    <>
        <header className="header">
            <div className='headerLeftPart'>
                <div className='logoContainer'>
                    <img className='logoImage' src={logo} alt='LumiTune logo' />
                </div>
                <span className='logoText'>LumiTune</span>
                
            </div>
            <div className='headerRightPart'>

                <div className="headerLinks">
                    <div className="headerSub">
                        <a href="#">Підписки</a>
                    </div>

                    <div className="headerHelp">
                        <a href="#">Підтримка</a>
                    </div>

                    <div className="headerAppDownload">
                        <a href="#">Завантажити додаток</a>
                    </div>
                </div>
                
                <div className="headerDivider"></div>

                <div className="headerRegistration">
                    <Link to="/registration">Реєстрація</Link>
                </div>
            </div>
        </header>
    </>
    );
}

export default Header;
