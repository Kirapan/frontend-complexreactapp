import React, { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from 'axios'
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function CreatePost(props) {
  const [title, setTitle] = useState()
  const [content, setContent] = useState()
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await Axios.post('/create-post',{
        title,
        body: content,
        token: appState.user.token
      })
      appDispatch({type: 'flashMessage', value: 'Congrats, you successfully created a new post.'})
      navigate(`/post/${res.data}`)
      console.log('post created')
    } catch (e) {
      console.log('post error', e)
    }
  }
  return (
    <Page title='Create New Post'>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => setTitle(e.target.value)}autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => setContent(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  )
}

export default CreatePost