let pyodide = null;

export async function runPython(code) {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
    });
  }

  try {
    let output = await pyodide.runPythonAsync(code);
    return output;
  } catch (err) {
    return err.toString();
  }
}
