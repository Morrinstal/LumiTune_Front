import './LandingTwo.css';
import grad1 from '../../assets/landingTwo/gradientOne.svg';
import grad2 from '../../assets/landingTwo/gradientTwo.svg';
import music from '../../assets/landingTwo/music.svg';
import lumik from '../../assets/landingTwo/Lumik.svg';

function LandingTwo() {
    return (
        <div className='landingTwo'>
            <img className='gradient1' src={grad1} alt='...' />
            <img className='gradient2' src={grad2} alt='...' />
            <img className='music'src={music} alt='...' />
            <img className='lumik'src={lumik} alt='...' />
            <div className='static'>
                <div className='band_songs'>
                    <div className='band_text'>
                        <div className='text100'>100m+</div>
                        <div className='text_songs'>Пісень</div>
                    </div>
                </div>
                <div className='band_podcasts'>
                    <div className='band_podcasts_text'>
                        <div className='text40'>40k+</div>
                        <div className='text_podcasts'>Підкастів</div>
                    </div>
                </div>
                <div className='band_performers'>
                    <div className='band_performers_text'>
                        <div className='text20'>20k+</div>
                        <div className='text_performers'>Виконавців</div>
                    </div>
                </div>                
            </div>
        </div>       
    );
}

export default LandingTwo;