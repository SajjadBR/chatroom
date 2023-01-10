import React from "react";
import { Device } from "./Devices";

type DeviceProps = {
    device:Device,
    onClick:React.MouseEventHandler<HTMLButtonElement>, 
    current?:boolean
}

export default function DeviceRow({device,onClick,current}:DeviceProps) {

    const date = new Date(device.createdAt);

    return (
        <button type="button" className={"d-flex justify-content-between border border-secondary my-1 p-2 w-100 btn "+(current?"btn-success":"")} onClick={onClick} title={"device id: "+device.id} data-bs-toggle="modal" data-bs-target="#deviceModal">
            <b className="">{device.device}</b>
            <span className="">{date.toLocaleDateString()}</span>
        </button>
    )
}
