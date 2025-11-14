(async function(){
      try{
        // disable button while running
        this.disabled=true; this.textContent='Loading...';

        // 1) Ensure sql.js script is available: if not, inject it into the page.
        if(!window.initSqlJs){
          await new Promise((resolve,reject)=>{
            var s=document.createElement('script');
            s.src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
            s.onload=resolve; s.onerror=()=>reject(new Error('Failed to load sql.js'));
            document.head.appendChild(s);
          });
        }

        // 2) Initialize the wasm-backed SQLite engine.
        // locateFile tells sql.js where to find the wasm file it needs.
        const SQL = await initSqlJs({
          locateFile: filename => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/'+filename
        });

        // 3) Fetch the database file from the same server (data.db must be in same folder).
        const resp = await fetch('data.db');
        if(!resp.ok) throw new Error('Failed to fetch data.db: '+resp.status);
        const ab = await resp.arrayBuffer();

        // 4) Open the database from the ArrayBuffer.
        const db = new SQL.Database(new Uint8Array(ab));

        // 5) Run the query and log the raw result to the console.
        //    result is an array of result objects; each has .columns and .values.
        const result = db.exec('SELECT * FROM comments');
        console.log('comments query result:', result);

        // optional feedback for user
        alert('Query executed. Open the console to see the result.');

      }catch(err){
        console.error(err);
        alert('Error: '+err);
      }finally{
        // re-enable button and restore label
        this.disabled=false;
        this.textContent='Load & log comments';
      }
    }).call(this)