import React, { useEffect, useState, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, Link, useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from 'axios'
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"


function EditPost() {
  const originalState = {
    title: {
      value:'',
      hasErrors: false,
      message: ''
    },
    body: {
      value:'',
      hasErrors: false,
      message: ''
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case 'titleChange':
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case 'bodyChange':
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case 'submitRequest':
        if (!draft.title.hasErrors && draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case 'saveRequestStarted':
        draft.isSaving = true
        return
      case 'saveRequestFinished':
        draft.isSaving = false
        return
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'You must provide a title.'
        }
        return
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'You must provide a body content.'
        }
        return
      case 'notFound':
        draft.notFound = true
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const res = await Axios.get(`/post/${state.id}`, {cancelToken: ourRequest.token});
        if (res.data) {
          dispatch({type: 'fetchComplete', value: res.data})
          if (appState.user.username != res.data.author.username) {
            appDispatch({type: 'flashMessage', value: 'you do not have permission to edit that post'})
            navigate('/')
          }
        } else {
          dispatch({type: 'notFound'})
        }
      } catch (e) {
        console.log(e)
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({type: 'saveRequestStarted'})
      const ourRequest = Axios.CancelToken.source()
      async function updatePost() {
        try {
          await Axios.post(`/post/${state.id}/edit`, {title: state.title.value, body: state.body.value, token: appState.user.token}, {cancelToken: ourRequest.token});
          dispatch({type: 'saveRequestFinished'})
          appDispatch({type: 'flashMessage', value: 'Congrats, you successfully update the post.'})
        } catch (e) {
          console.log(e)
        }
      }
      updatePost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  function submitHandler(e) {
    e.preventDefault();
    dispatch({type: 'titleRules', value: state.title.value})
    dispatch({type: 'bodyRules', value: state.body.value})
    dispatch({type: 'submitRequest'})
  }

  if (state.notFound) return <NotFound />

  if (state.isFetching) return (
    <Page title=',,,,'>
      <LoadingDotsIcon />
    </Page>
  )

  return (
    <Page title='Edit Post'>
      <Link className="small font-weight-bold" to={`/post/${state.id}`} >&laquo;Back to posts</Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({type: 'titleRules', value: e.target.value})} onChange={e => dispatch({type: 'titleChange', value: e.target.value})} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidationMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({type: 'bodyRules', value: e.target.value})} onChange={e => dispatch({type: 'bodyChange', value: e.target.value})} name="body" id="post-body" className="body-content tall-textarea form-control" type='text' value={state.body.value}></textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidationMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>Save Updates</button>
      </form>
    </Page>
  )
}

export default EditPost