import './LandingOne.css';
import backgroundGradient from '../../assets/backgroundLandingOne.png';
import lumituneLogoText from '../../assets/lumituneLogoText.svg';
import stairs from '../../assets/stairs.svg';
import lumikBig from '../../assets/LumikBig.svg';
import { Link } from 'react-router-dom';

function LandingOne() {
  return (
    <div className="landingOne">
      <div className="gradientOverlay">
        <img src={backgroundGradient} alt="Gradient overlay" />
      </div>

      <div className="landingContent"> 

        <img src={lumituneLogoText} alt="Lumitune Logo Text" className="lumituneLogoText" />

        <div className="descriptionBlock">
          <div className="descriptionSection">
            <div className="mainHeading">Закортилося чогось новенького у рутині?</div>
            <div className="subHeading">Мерщій приєднуйся до шабашу музик! Тут звучать ритми, історії!</div>
          </div>

          <div className="buttonsSection">
            <div className="buttonPrimary">
              <Link to="/login">Увійти</Link>
            </div>
            <div className="buttonSecondary">
              <Link to="/registration">Зареєструватися</Link>
            </div>
          </div>
        </div>

        <img src={stairs} alt="Staircase Image" className="stairs" />
        <img src={lumikBig} alt="Lumik Mascot Image" className="lumikBigImage" />
        
      </div>

    </div>

  );
}

export default LandingOne;

