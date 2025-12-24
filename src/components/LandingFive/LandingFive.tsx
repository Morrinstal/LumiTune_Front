import './LandingFive.css';
import grad from '../../assets/landingFive/grad.svg';
import lumik5 from '../../assets/landingFive/Lumik1.svg';
import note2_5 from '../../assets/landingFive/note2_5.svg';
import note2_002_5 from '../../assets/landingFive/note2_002_5.svg';
import note1_001_5_left from '../../assets/landingFive/note1_001_5.svg';
import note3_002_5 from '../../assets/landingFive/note3_002_5.svg';
import logo from '../../assets/landingFive/logo.svg';
import note_5 from '../../assets/landingFive/note_5.svg';
import ai from '../../assets/landingFive/Ai.svg';
import brush_and_paints from '../../assets/landingFive/brush_and_paints.svg';
import cloud_storage from '../../assets/landingFive/cloud_storage.svg';


function LandingFive() {
    return (
        <div className='landingFive'>
            <img className='grad5' src={grad} alt='...' /> 
            <img className='lumik5' src={lumik5} alt='...'/>
            <img className='note2_5_top_left' src={note2_5} alt='...'/>
            <div className='text5'>Що робить LumiTune особливим?</div>
            <img className='note2_002_5_top_right' src={note2_002_5} alt='...' />
            <img className='note1_001_5_left' src={note1_001_5_left} alt='...' />
            <img className='note3_002_right' src={note3_002_5} alt='...' />
            <div className='free_media_library'>
                <div className='media_library'>
                    <img className='note_5' src={note_5} alt='...'/>
                    <div className='band_free'>
                        <div className='text_free'>Безкоштовна медіатека</div>
                        <div className='text_listen'>Слухай музику без реклами, пауз і з об’ємним звучанням.</div>
                    </div>
                </div>
            </div>
            <div className='band_intellectual_recommendations'>
                <div className='intellectual_recommendations'>
                    <img className='ai' src={ai} alt='...'/>
                    <div className='band_intellectual'>
                        <div className='text_ai'>Інтелектуальні рекомендації</div>
                        <div className='text_lumitune'>LumiTune вивчає твої вподобання та пропонує ідеальні треки для настрою.</div>
                    </div>
                </div>
            </div>
            <div className='band_cloud_storage'>
                <div className='cloud'>
                    <img className='cloud_storage' src={cloud_storage} alt='...'/>
                    <div className='band_cloud'>
                        <div className='text_storage'>Хмарне зберігання</div>
                        <div className='text_tracks'>Усі твої треки доступні з будь-якого пристрою — у додатку або браузері.</div>
                    </div>
                </div>
            </div>
            <div className='interface_personalization'>
                <div className='band_interface'>
                    <img className='brush_and_paints' src={brush_and_paints} alt='...'/>
                    <div className='band_personalization'>
                        <div className='text_personalization'>Персоналізація інтерфейсу</div>
                        <div className='text_interface'>Зручний інтерфейс, який можна налаштовувати під себе.</div>
                    </div>
                </div>
            </div>
            <div className='listen_feel_relax'>
                <div className='listen_feel_relax_2'>
                    <img className='logo' src={logo} alt='...' />
                    <div className='listen'>Слухайте</div>
                    <img className='logo_2' src={logo} alt='...' />
                    <div className='feel'>Відчувайте</div>
                    <img className='logo_3' src={logo} alt='...' />
                    <div className='relax'>Відпочивайте</div>
                    <img className='logo_4' src={logo} alt='...' />
                </div>
            </div>
        </div>
    );
}

export default LandingFive;