import "./Header.css"
import { MdOutlineLogout } from 'react-icons/md'
import { useNavigate, Link } from "react-router-dom";

function Header(props) {
    const navigate = useNavigate();

    return (
        <div id="header">
            <Link id="logoLink" to="/"><b id="logo"> 409 Labs </b></Link>
            <MdOutlineLogout
            id="logoutBtn"
            onClick={() => {
                sessionStorage.setItem("token", null);
                navigate('/signin')
            }}
        />
        </div>
    )
}

export default Header;