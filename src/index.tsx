import './index.css';

import ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from 'react';

import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path.plugin';
import { fetchPlugin } from './plugins/fetch.plugin';


const clog = false;

const App = () => {
   const ref = useRef<any>();
   const iframe = useRef<any>();

   const [input, setInput] = useState('');
   const startService = async () => {
      ref.current = await esbuild.startService({
         worker: true,
         wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
      });
      // console.log(service);
   };

   useEffect(() => {
      startService();
   }, []);


   const onClick = async () => {
      if (!ref.current) {
         return;
      }
                                                                        if (clog) console.log(ref.current);

      iframe.current.srcdoc = html;

      const result = await ref.current.build({
         entryPoints: ['index.js'],
         bundle: true,
         write: false,
         plugins: [unpkgPathPlugin(), fetchPlugin(input)],
         define: {
            'process.env.NODE_ENV': '"production"',
            global: 'window'
         }
      });
                                                                        if (clog) console.log('result(build) =', result);

      iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
   }

   const html = `<html>
                  <head></head>
                  <body>
                     <div id="root"></div>
                     <script>
                        window.addEventListener('message', (event) => {
                           try {
                              eval(event.data);
                           } catch(err) {
                              const root = document.querySelector('#root');
                              if(root) root.innerHTML = '<div style="color: red;"><h4>Runtime Error:</h4>' + err + '</div>'
                              throw err;
                           }
                        }, false);
                     </script>
                  </body>
                 </html>`;

   return (
      <div>
         <textarea placeholder='Please start coding now...'
            onChange={ e => setInput(e.target.value) }
            value={ input }
         />
         <div>
            <button onClick={onClick}>Submit</button>
         </div>
         <iframe ref={iframe} sandbox="allow-scripts" srcDoc={ html } title="sandbox" />
      </div>
   );
};

ReactDOM.render(<App />, document.querySelector('#root'));