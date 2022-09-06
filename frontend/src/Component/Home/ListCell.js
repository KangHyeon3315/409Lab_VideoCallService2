import { BiDotsVerticalRounded } from 'react-icons/bi';
import defaultProfile from '../../res/defaultProfile.png';
import Popup from 'reactjs-popup';
import './ListCell.css'

export default function ListCell(props) {
    return (
        <div className='listCell'
            style={{ backgroundColor: props.selected ? "#44444422" : null }}
        >
            <div className='subCell' onClick={() => {
                if (props.clicked) {
                    props.clicked(props)
                }
            }}>

                <img className='listCellImg' alt="profile" src={defaultProfile} width="100%" height="100%" />

                <div className='listCellInfo'>
                    <div className='listCellTitle'>
                        {props.title}
                    </div>
                    <div className='listCellComment'>
                        {props.comment}
                    </div>
                </div>
            </div>
            {
                props.deleteDisable ? null :
                    <Popup
                        position="bottom right"
                        trigger={
                            <button className='listCellOption'>
                                <BiDotsVerticalRounded />
                            </button>
                        }
                    >
                        <div className='optionBtnWrap'>
                            <button className='optionBtn'
                                onClick={() => {
                                    if (props.deleteClicked)
                                        props.deleteClicked();
                                }}
                            >삭제하기</button>
                        </div>

                    </Popup>
            }



        </div>
    )
}