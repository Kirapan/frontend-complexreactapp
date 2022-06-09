import React, { useEffect, useState, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import StateContext from "../StateContext"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowing() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const {username} = useParams()
  const appState = useContext(StateContext)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const res = await Axios.get(`profile/${username}/following`, {cancelToken: ourRequest.token})
        setPosts(res.data)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />
  return (
    <div className="list-group">
        {posts.map((follower, index) => {
          return (
            <Link to={`/profile/${follower.username}`} key={index} href="#" className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={follower.avatar} />{follower.username}
            </Link>
          )
        })}
      </div>
  )
}

export default ProfileFollowing