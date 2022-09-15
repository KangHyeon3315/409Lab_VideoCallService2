import React from "react";
import './Member.css'

function MemberCell(props) {
    return (
        <div className="MemberCellWrap">
            <div className="MemberCell">
                <div className="MemberIcon">
                    -
                </div>
                <div className="MemberName">
                    {props.name}
                </div>
            </div>
        </div>

    )
}

export default function Member(props) {
    const MemberList = props.MemberList;

    let MemberCellList = [];
    MemberList.forEach(MemberInfo => {
        MemberCellList.push(
            <MemberCell
                key={MemberInfo.userId}
                name={MemberInfo.name}
            />
        )
    })


    return (
        <div className="MemberListWrap">
            {MemberCellList}
        </div>
    )
}