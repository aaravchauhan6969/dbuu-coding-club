import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lineNumbers } from "@codemirror/view";
import React, { useState, useEffect, useRef } from "react";
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching
} from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { history, historyKeymap, indentWithTab } from "@codemirror/commands";

function App() {
  const editorRef = useRef(null);
  const editorView = useRef(null);
  const [output, setOutput] = useState("");

  // ---------------- LOAD PYODIDE + FIX PRINT() ----------------
  useEffect(() => {
    const loadPy = async () => {
      window.pyodide = await window.loadPyodide();
      console.log("Pyodide loaded!");

      // ARRAY TO STORE OUTPUT
      window.captureOutput = [];

      // JS function jo Python se print() aane par call hoti hai
      window.print_capture = (msg) => {
        window.captureOutput.push(msg);
      };

      // PYTHON PRINT KO OVERRIDE KARNA
      await window.pyodide.runPythonAsync(`
import js

def __js_print__(*args):
    js.print_capture(" ".join(str(a) for a in args) + "\\n")

import builtins
builtins.print = __js_print__
`);
    };

    loadPy();
  }, []);

  // ---------------- SETUP CODEMIRROR ----------------
  useEffect(() => {
    if (editorRef.current && !editorView.current) {
      const startCode = `print("Hello DBUU Coding Club!")`;

      const state = EditorState.create({
        doc: startCode,
        extensions: [
          oneDark,
          lineNumbers(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          syntaxHighlighting(defaultHighlightStyle),
          highlightActiveLine(),
          bracketMatching(),
          closeBrackets(),                // ← auto bracket ON
          keymap.of(closeBracketsKeymap), // ← auto bracket ka keymap
          indentOnInput(),
          python(),
          keymap.of([...historyKeymap, indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (update.changes)
              localStorage.setItem("dbuu-code", update.state.doc.toString());
          }),
          EditorView.theme({
            "&": {
              height: "420px",
              borderRadius: "8px",
              background: "#1e1e1e"
            }
          })
        ]
      });

      editorView.current = new EditorView({
        state,
        parent: editorRef.current
      });
    }
  }, []);

  // ---------------- RUN PYTHON CODE ----------------
  const runCode = async () => {
    try {
      const code = editorView.current.state.doc.toString();

      window.captureOutput.length = 0; // old output clear

      await window.pyodide.runPythonAsync(code);

      const finalOut =
        window.captureOutput.join("") || "(Program Finished, No Output)";

      setOutput(finalOut);
    } catch (err) {
      setOutput(String(err));
    }
  };

  // ---------------- UI LAYOUT ----------------
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#121212",
        color: "white"
      }}
    >
      {/* Sidebar */}
      <div style={{ width: "60px", background: "#1e1e1e", padding: "10px" }}>
        <div style={{ fontSize: "28px", textAlign: "center", opacity: 0.6 }}>
          ≡
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>
          DBUU Coding Club – Python Editor
        </h2>
        <div ref={editorRef}></div>

        <button
          onClick={runCode}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            background: "#0078ff",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          ▶ Run
        </button>
      </div>

      {/* Output */}
      <div
        style={{
          width: "35%",
          background: "#000",
          padding: "15px",
          margin: "20px",
          borderRadius: "8px",
          color: "white",
          fontFamily: "monospace",
          overflowY: "auto"
        }}
      >
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;
