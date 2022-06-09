import React, { useEffect, useState, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from 'axios'
import StateContext from "../StateContext"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const {username} = useParams()
  const appState = useContext(StateContext)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const res = await Axios.get(`profile/${username}/posts`, {cancelToken: ourRequest.token})
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
        {posts.map(post => {
          return <Post noAuthor={true} post={post} key={post._id} />
        })}
      </div>
  )
}

export default ProfilePosts