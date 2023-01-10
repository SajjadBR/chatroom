import { useEffect, useState } from "react"
import { Tokens } from "../App";
import DeviceDetails from "./DeviceDetails";
import DeviceRow from "./DeviceRow";
import { logout } from "./Dashboard";


export type Device = {
    id:number,
    ip:string,
    browser:string,
    os:string,
    device:string,
    token:string,
    createdAt:string
}

export default function Devices() {
  const [devicesList, setDevicesList] = useState<Device[]>([])
  const [thisDevice, setThisDevice] = useState<Device>()
  const [selected, setSelected] = useState<Device>()
    
  async function terminate(){
    if(!selected)return;

    try{
      await logout(selected.token);
      setDevicesList(current => current.filter(dev => dev.id !== selected.id));
      setSelected(undefined)
    }
    catch(err:any){
      console.log(err.message);
    }
  }

  useEffect(() => {
    async function getDevices(){
      const res = await fetch(window.origin+"1/user/sessions", {
          method: "POST",
          headers: {
              "authorization": Tokens.access
          }
      });

      if(res.ok) {
        const data = await res.json();
        if(data.error) return console.warn(data.error);        
        return setDevicesList(data.sessions.filter((session:any) => {
          if(session.token === Tokens.refresh) {
            setThisDevice(session);
            return false;
          } 
          return true;
        }));
      }
      const message = await res.text();
      console.log(message);
      if(message === "jwt expired"){
        await Tokens.updateTokenSync();
        getDevices();
      }
    }
    getDevices();

  },[])

  return (
    <div className="p-2">
      {thisDevice && <DeviceRow device={thisDevice} onClick={e => setSelected(thisDevice)} current/>}
      {devicesList?.map(device => <DeviceRow onClick={e => setSelected(device)} key={device.id} device={device} />)}
      {devicesList.length === 0 && <span>No other active Devices</span>}
      <DeviceDetails terminate={terminate} leave={() => setSelected(undefined)} device={selected} current={selected?.id === thisDevice?.id} />
    </div>
  )
}
