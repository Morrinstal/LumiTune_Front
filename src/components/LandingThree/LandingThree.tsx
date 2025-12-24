import './LandingThree.css'
import gradient from '../../assets/landingThree/background3.svg';
import download from '../../assets/landingThree/Download--Streamline-Rounded-Material-Symbols.svg.svg';
import mainblue from '../../assets/landingThree/mainblue.svg';
import pencil from '../../assets/landingThree/pencil.svg';

function LandingThree() {
    return (
        <div className='landingThree'>
            <img className='gradient' src={gradient} alt='...' />
            <div className='band_info'>
                <div className='band_info_text'>Додавай свої треки до медіатеки!</div>
                <div className='band_download'>
                    <img className='download'src={download} alt='...' />
                    <div className='band_download_band_1'>
                        <div className='band_download_band_2'>
                            <div className='band_download_text'>Прямо з комп’ютера завантажуй музику!</div>
                        </div>
                    </div>
                </div>
                <div className='band_playlist'>
                    <div className='band_playlist_band_1'>
                        <div className='band_playlist_band_2'>
                           <div className='band_playlist_text'>Створюй плейлисти та слухай, коли хочеш!</div>
                        </div>
                    </div>
                    <img className='pencil'src={pencil} alt='...' />
                </div>
            </div>
            
            <img className='mainblue' src={mainblue} alt='...' />
        </div>       
    );
}

export default LandingThree;