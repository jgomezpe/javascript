/**
*
* python.js
* <P>A client for a Python server (See <A HREF="https://github.com/jgomezpe/aplikigo">aplikigo</A> package) </P>
* <P>Requires Konekti.js, and finapunkto.js </P>
* <P>A numtseng module <A HREF="https://numtseng.com/modules/python.js">https://numtseng.com/modules/python.js</A> 
* Copyright (c) 2021 by Jonatan Gomez-Perdomo. <br>
* All rights reserved. See <A HREF="https://github.com/jgomezpe/python">License</A>. <br>
*
* @author <A HREF="https://disi.unal.edu.co/~jgomezpe/"> Professor Jonatan Gomez-Perdomo </A>
* (E-mail: <A HREF="mailto:jgomezpe@unal.edu.co">jgomezpe@unal.edu.co</A> )
* @version 1.0
*/

/*
 * A Javascript server
 */
class JSServer{
	constructor(id, jsclient){
		this.client = Konekti.client(id) 
		this.jsclient = jsclient
	}
	
	message(txt){
		this.done = true
		var iframe = document.getElementById(this.client.id+'Frame')
		iframe.contentWindow.eval("document.getElementById('error').innerHTML = " + JSON.stringify(txt) + "\n"+
				"terminal.setText('')\n"+
 				"document.getElementById('out').done = true\n")
	}
    			
	run(code){
		this.done = false
		var x = this
		var iframe = document.getElementById(x.client.id+'Frame')
		iframe.contentWindow.eval("terminal.setText('')")
		code =  "try {\n"+ 
    			code+"\n"+
    			"} catch(e){\n"+
    			"document.getElementById('error').innerHTML = e.message\n"+
    			"}\n"+
 				"document.getElementById('out').done = true\n"
		console.log(code)		
		iframe.contentWindow.eval(code)
		function check(){
			var out = iframe.contentWindow.document.getElementById('out')
			if( !x.done && ( out === undefined || out === null || !out.done ) ) setTimeout(check,200)
			else{
				x.done = true
				x.jsclient.stopButton('run')
			} 
		}
		check()
	}
    
	end(){ this.message("Stopped") }
}
 
/*
 *
 * A client for a JavaScript interpreter
 */  
class JavaScript extends Client{
	/**
	 * Creates a JavaScript interpreter client
	 * @param config Configuration includes
	 * id: GUI's id,
	 * editor: Editor's id
	 * run: Run button's id 
	 * console: Console/Terminal's id
	 * type If JavaScript console will be displayed as a row ('row') or as a column ('col') 
	 * captionRun Caption for the run button when ready for running javascript code (to start code running)
	 * captionStop Caption for the run button when running javascript code (to stop code running)
	 */
	constructor(config){
		super(config.id+"JS")
		this.running = false
		this.server = null
		this.captionRun = config.captionRun || ''
		this.captionStop = config.captionStop || ''
		this.editorID = config.editor || 'coderJS'
		this.consoleID = config.console || 'viewerJS'
		this.btnID = config.run || 'runJS'
		var type = config.type || 'col'
		
		Konekti.split( 
		  { "id":config.id, "type":type,
		  "start":60,
		  "one":{
		  	"plugin":"hcf", 
		  	"content":{ "plugin":"ace","id":this.editorID,"mode":"javascript","initial":"x=prompt('?')\nconsole.log(x+3)\n" },
		  	"header":{"plugin":"btn","id":this.btnID, "icon":"fa fa-play","caption":this.captionRun,
		  	  "options":"w3-bar-item w3-medium","onclick":{"client":this.id, "method":"run"}}
		  },
		  "two":{"plugin":"iframe","id":this.consoleID,"src":"https://numtseng.com/modules/js/jsconsole.html"}
		}
		)
	}
	
	stopButton(){
		var x = this
		var btn = Konekti.client(x.btnID)
		btn.update({"icon":"fa fa-play","caption":x.captionRun})
		x.running = false
	}

	/**
	 * Function called when run button is pressed
	 * @param btnId Run button id
	 */
	run(){
		var x = this
		var editor = Konekti.client(x.editorID)
		var btn = Konekti.client(x.btnID)
		if( x.running ){
			x.stopButton(x.btnID)
			x.server.end()
		}else{
			x.running = true
			btn.update({"icon":"fa fa-stop","caption":x.captionStop})
			if(x.server == null) x.server = new JSServer(x.consoleID, x)
			setTimeout(function(){ x.server.run(editor.getText()) }, 100)
		}
	}
}

