import './LandingFour.css'
import grad1 from '../../assets/landingFour/gradient1.svg';
import grad2 from '../../assets/landingFour/gradient2.svg';
import note1_001_1 from '../../assets/landingFour/note1_001.svg';
import download from '../../assets/landingFour/download.svg';
import headphones from '../../assets/landingFour/headphones.svg';
import iPhone16 from '../../assets/landingFour/iPhone 16.svg';
import note from '../../assets/landingFour/note.svg';
import note2 from '../../assets/landingFour/note2.svg';
import note3_002 from '../../assets/landingFour/note3_002.svg';


function LandingFour() {
    return(
        <div className='landingFour'>
            <img className='gradient1' src={grad1} alt='...' />
            <img className='gradient2' src={grad2} alt='...' />
            <div className='text_info'>Що можна у нашому застосунку!</div>
            <img className='note1_001_1' src={note1_001_1} alt='...' />
            <img className='note1_001_2' src={note1_001_1} alt='...' />
            <img className='note1_001_3' src={note1_001_1} alt='...' />
            <img className='iPhone16' src={iPhone16} alt='...' />
            <div className='band_steps'>
                <div className='band_step1'>
                    <img className='download' src={download} alt='...' />
                    <div className='band_step1_1'>
                        <div className='step1'>Крок перший</div>
                        <div className='download_addition'>Завантажуй додаток</div>
                        <div className='install_app'>Поринь у світ музики — встанови додаток LumiTune за кілька секунд!</div>
                    </div>
                </div>
                <div className='band_step2'>
                    <img className='note' src={note} alt='...' />
                    <div className='band_step2_1'>
                        <div className='step2'>Крок другий</div>
                        <div className='song_transfers'>Переноси свої улюблені треки</div>
                        <div className='add_tracks'>Забирай треки з собою та додавай до медіатеки.</div>
                    </div>
                </div>
                <div className='band_step3'>
                    <img className='headphones' src={headphones} alt='...' />
                    <div className='band_step3_1'>
                        <div className='step3'>Крок третій</div>
                        <div className='listen_offline'>Слухай оффлайн</div>
                        <div className='no_internet'>Не потрібен інтернет — слухай будь-де.</div>
                    </div>
                </div>
            </div>
            <img className='note2' src={note2} alt='...' />
            <img className='note3_002' src={note3_002} alt='...' />
        </div>
    );
}

export default LandingFour;