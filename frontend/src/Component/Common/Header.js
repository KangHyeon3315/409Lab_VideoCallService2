import "./Header.css"
import { MdOutlineLogout } from 'react-icons/md'
import { useNavigate } from "react-router-dom";

function Header(props) {
    const navigate = useNavigate();

    let logoutBtn = null;
    if (props.isLogin) (
        logoutBtn = <MdOutlineLogout
            id="logoutBtn"
            onClick={() => {
                sessionStorage.setItem("token", null);
                navigate('/signin')
            }}
        />
    )

    return (
        <div id="header">
            <b id="logo">
                409 Labs
            </b>
            {logoutBtn}
        </div>
    )
}

export default Header;