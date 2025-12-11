import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ onRun }) {
  const editorRef = useRef(null);

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  function runCode() {
    const code = editorRef.current.getValue();
    onRun(code);
  }

  return (
    <div>
      <Editor
        height="70vh"
        theme="vs-dark"
        defaultLanguage="python"
        defaultValue="# Write your Python code here"
        onMount={handleEditorMount}
      />
      <button onClick={runCode}>Run</button>

      <pre id="outputBox" style={{
        background: "#eee",
        padding: "10px",
        minHeight: "100px"
      }}></pre>
    </div>
  );
}
