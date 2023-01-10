import { Device } from "./Devices";

type DDP = {
    device:Device | undefined,
    leave:() => void,
    terminate:() => void,
    current?:boolean
}

export default function DeviceDetails({device,terminate,current}:DDP) {
    const date = new Date(device?.createdAt || "");
    return (
        <div className="modal fade" id="deviceModal" aria-labelledby="deviceModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Device</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body ">
                    {
                    device && <>
                        <div className="row"><i className="material-icons col-1">devices</i><span className="col-6">{device.device}</span><small className="col-5">Device</small></div>
                        <div className="row"><i className="material-icons col-1">{device.os.split(":")[0].toLowerCase()}</i><span className="col-6">{device.os}</span><small className="col-5">operating system</small></div>
                        <div className="row"><i className="material-icons col-1">web</i><span className="col-6">{device.browser}</span><small className="col-5">browser</small></div>
                        <div className="row"><i className="material-icons col-1">language</i><span className="col-6">{device.ip}</span><small className="col-5">ip address</small></div>
                        <div className="row"><i className="material-icons col-1">calendar_month</i><span className="col-6">{date.toLocaleDateString()}</span><small className="col-5">date</small></div>
                        <div className="row"><i className="material-icons col-1">timer</i><span className="col-6">{date.toLocaleTimeString()}</span><small className="col-5">time</small></div>
                    </>
                    }

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        {!current && <button onClick={terminate} className="btn btn-danger" data-bs-dismiss="modal" type="submit" title="logout from this device"><i className="material-icons">power_settings_new</i>terminate</button> }
                    </div>
                </div>
            </div>
        </div>
    )
}
