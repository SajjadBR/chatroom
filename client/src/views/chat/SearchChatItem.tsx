import { Link } from "react-router-dom"

type SCIProps = {
    result:any
} 

export default function SearchChatItem({result}:SCIProps) {
  return (
    <Link to={`/chats/${result.username}`} className="m-0 mb-2 p-2 row w-100 align-items-center overflow-x-hidden border border-secondary rounded">
      <img className="col-4 col-md-2 rounded-circle" src={`${window.origin}1/img/profile/${result.id}`} alt="profile" />
      <span className="col-4 col-md-6  ">{result.name}</span>
      <span className="col-4 text-secondary">@{result.username}</span>
    </Link>
  )
}
