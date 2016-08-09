'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import ReactHighlight from 'react-highlight';
import CopyToClipboard from 'react-copy-to-clipboard';

function transformer(state, action)
{
  switch(action.type)
  {
    case 'LOADING_TREE': return { ...state, isLoadingFile: false, isLoadingTree: true }
    case 'LOADED_TREE':  return { ...state, isLoadingFile: false, isLoadingTree: false, tree: action.tree }
    case 'LOADING_FILE': return { ...state, isLoadingFile: true,  contents: "", selected_path: action.path }
    case 'LOADED_FILE':  return { ...state, isLoadingFile: false, contents: action.contents }
  }

  return {}
}

let store = Redux.createStore(transformer)
store.dispatch({type: 'LOADED_TREE', tree: { directories: [], files: [] } })

store.subscribe(() => {
  let state = store.getState()

  if (state.isLoadingFile)
  {
    fetch(`/code?file=${state.selected_path}`).
      then(response => response.text()).
      then(data => { store.dispatch({type: 'LOADED_FILE', contents: data }) })
  }
})

store.subscribe(() => {
  let state = store.getState()

  if (state.isLoadingTree)
  {
    fetch('/directory.json').then(response => response.json()).
                             then(data => { store.dispatch({type: 'LOADED_TREE', tree: data }) })
  }
})

class File extends React.Component
{
  handleClick(path)
  {
    store.dispatch({type: 'LOADING_FILE', path})
    window.history.pushState(null, null, "/file?path=" + path);
  }

  render()
  {
    return (
      <li onClick={this.handleClick.bind(this, this.props.path)} className={`file ${this.props.path == store.getState().selected_path ? 'active' : ''}`}>
        <a>{this.props.name}</a>
      </li>
    )
  }
}

class Directory extends React.Component
{
  render()
  {
    let state = store.getState();
    let checked = (state.selected_path && state.selected_path.startsWith(this.props.path)) ? "checked" : "";

    return (
      <li>
        <label>{this.props.name}</label>
        <input type="checkbox" defaultChecked={checked}/>
        <SubDirectory directories={this.props.directories} files={this.props.files}/>
      </li>
    )
  }
}

class SubDirectory extends React.Component
{
  get directories()
  {
    return this.props.directories.map(
      (directory) => <Directory key={directory.path}
                                path={directory.path}
                                name={directory.name}
                                directories={directory.directories}
                                files={directory.files}/>
    )
  }

  get files()
  {
    return this.props.files.map(
      (file) => <File name={file.name} key={file.path} path={file.path}/>
    )
  }

  render()
  {
    return (
      <ol>
        {this.directories}
        {this.files}
      </ol>
    )
  }
}

class Tree extends React.Component
{
  constructor(props) {
    super(props)
    this.state = store.getState()
  }

  componentDidMount()
  {
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render()
  {
    return (
      <div id="tree">
        <SubDirectory directories={this.state.tree.directories} files={this.state.tree.files}/>
      </div>
    )
  }
}

class CurrentlyViewingPath extends React.Component
{
  constructor(props)
  {
    super(props)
    this.state = store.getState()
  }

  componentDidMount()
  {
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render()
  {
    return (
      <h1 id="currently-viewing-path">
        {this.state.selected_path}
      </h1>
    )
  }
}

class FileViewer extends React.Component
{
  constructor(props)
  {
    super(props)
    this.state = store.getState()
  }

  componentDidMount()
  {
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render()
  {
    let extension = /(?:\.([^.]+))?$/.exec(this.state.selected_path)[1];

    return (
      <div>
        <CopyToClipboard text={this.state.contents}>
          <a className="copy">Copy to clipboard</a>
        </CopyToClipboard>
        <ReactHighlight className={extension}>
          {this.state.contents}
        </ReactHighlight>
      </div>
    )
  }
}

class App extends React.Component
{
  constructor()
  {
    super();

    this.ws = new WebSocket('ws://' + window.location.host + '/updates');

    this.ws.onmessage = (message) => {
      let state = store.getState();
      let data = JSON.parse(message.data)
      if (data.tree)
      {
        store.dispatch({ type: 'LOADED_TREE', tree: data.tree });
      }
      if (data.content && (data.path === state.selected_path))
      {
        store.dispatch({ type: 'LOADED_FILE', contents: data.content });
      }
    };
  }

  componentDidMount()
  {
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render()
  {
    return (
         <div id="app">
           <div id="sidebar">
             <Tree key='app'/>
           </div>
           <div id="main">
             <CurrentlyViewingPath key='currently-viewing-path'/>
             <FileViewer key='fileviewer'/>
           </div>
         </div>
    )
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
)

store.dispatch({type: 'LOADING_TREE'})
let defaultPath = document.getElementById("root").getAttribute("data-path");
if (defaultPath)
{
  store.dispatch({type: 'LOADING_FILE', path: defaultPath});
}
else
{
  store.dispatch({type: 'LOADED_FILE', contents: defaultPath});
}
