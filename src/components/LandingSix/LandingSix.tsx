import './LandingSix.css'
import gradViolet from '../../assets/LandingSix/gradViolet.png'
import gradGreen from '../../assets/LandingSix/gradGreen.png'
import lum_1 from '../../assets/LandingSix/lum_1.png'
import lum_2 from '../../assets/LandingSix/lum_2.png'
import downloadIcon from '../../assets/LandingSix/downloadIcon.svg'
import noteBlue from '../../assets/LandingSix/noteBlue.png'
import noteViolet from '../../assets/LandingSix/noteViolet.png'
import noteDarkBlue_1 from '../../assets/LandingSix/noteDarkBlue_1.png'
import noteDarkBlue_2 from '../../assets/LandingSix/noteDarkBlue_2.png'


function LandingSix() {
    return (
        <>
            <div className='landingSix'>
                <img className='gradViolet' src={gradViolet} alt='Violet Gradient' />
                <img className='gradGreen' src={gradGreen} alt='Green Gradient' />

                <img className='lum_1' src={lum_1} alt='Mascot Picture 1' />
                <img className='lum_2' src={lum_2} alt='Mascot Picture 2' />

                <div className='interestBanner'>
                    <div className='textBlock'>
                        Зацікавились? <br /> Скоріше приєднуйтесь!
                    </div>
                    <div className="buttonDownload">
                        <img className='downloadIcon' src={downloadIcon} alt='Download Icon' />
                        <a href="#">Завантажити застосунок</a>
                    </div>
                </div>
                
                <img className='noteBlue-1' src={noteBlue} alt='Image of a note' />
                <img className='noteBlue-2' src={noteBlue} alt='Image of a note' />
                <img className='noteViolet-1' src={noteViolet} alt='Image of a note' />
                <img className='noteViolet-2' src={noteViolet} alt='Image of a note' />
                <img className='noteDarkBlue-1' src={noteDarkBlue_1} alt='Image of a note' />
                <img className='noteDarkBlue-2' src={noteDarkBlue_2} alt='Image of a note' />
            </div>
        </>
    );
}

export default LandingSix;