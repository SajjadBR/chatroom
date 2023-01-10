
type PVTProps = {
    input:React.RefObject<HTMLInputElement>
}
export default function PasswordVisibilityToggler({input}:PVTProps) {
    function toggleVisibility(e:React.MouseEvent){
        if(input.current?.type === "text"){
            input.current.type = "password"
            e.currentTarget.textContent = "visibility"
        }
        else if(input.current?.type === "password"){
            input.current.type = "text"
            e.currentTarget.textContent = "visibility_off"

        }
    }

  return (
    <button type="button" className="btn material-icons" onClick={toggleVisibility}>visibility</button>
  )
}
