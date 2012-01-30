/**
 * The mozajik-tool.js file contains all the custom Mozajik tools.
 * @author Thierry Bela, modified by Aron Budinszky /aron@mozajik.org/
 * @version 1.3
 * @requires MozajikBase, MooTools 1.3+, Mootools/Asset
 **/

/**
 * Adds shorten method to string.
 **/
String.implement({shorten: function (max, end) { max = max || 20; end = end || 12; if(this.length > max) return this.substring(0, max - end - 3) + '... ' + this.substring(this.length - end + 1); return this } });
	
/**
 * Provides UploadManager.
 * @see http://mootools.net/forge/p/uploadmanager
 **/
(function ($, window) {
	var store = 'umo',
		transport = 'upl:tr',
		div = new Element('input', {type: 'file'}),
		
		uploadManager = this.uploadManager = {
			
			/* xmlhttp can be used */
			xmlhttpupload: !!div.files,
			
			/* can handle multiple files upload */
			multiple: 'multiple' in div,
						
			//upload hash
			uploads: {},
			
			active: false,
			//active transfers
			actives: {},
			
			//queue uploads per container
			enqueue: false,
			
			//transfer queue, callback functions
			queue: {},
			
			/*
			
				attach file dragdrop events onto el
			*/
			
			attachDragEvents: function (el, options) {
			
				$(el).addEvents(dragdrop).store(store, options).grab(new Element('div', {text: 'Drop files here', 'style': 'display:none'}), 'top');								
				return this
			},

			/*
			
				detach file dragdrop events from el
			*/
			
			detachDragEvents: function (el) {
			
				el = $(el);
				if(el.retrieve(store)) $(el).removeEvents(dragdrop).eliminate(store).getFirst().destroy();
				return this			
			},	

			upload: function(options) {
			
				var opt = Object.merge({limit: 0, filesize: 0, maxsize: 0/*, iframe: false */}, options),
					container = opt.container,
					transfer;
				
				if(!this.uploads[container]) {
				
					this.actives[container] = [];
					this.uploads[container] = []
				}
				
				//restrict number of uploaded files
				if(opt.limit > 0 && this.uploads[container].length >= opt.limit) return null;
				
				//where to send the uploaded file
				opt.base = opt.base || 'upload.php';
				opt.id =  opt.name.replace(/[^a-z0-9]/gi, '') + +new Date();
				
				transfer = !opt.iframe && this.xmlhttpupload ? new HTML5Transfert(opt) : new Transfert(opt);
			
				this.uploads[container].push(transfer);
			
				return transfer.fireEvent('create', transfer)
			},
			
			push: function(container, callback) {
			
				this.queue[container] = this.queue[container] || [];				
				this.queue[container].push(callback);
				
				return this.load(container)
			},
			
			load: function (container) {
			
				if(!this.enqueue || !this.active) {
					
					var callback = this.queue[container].shift();
					if(callback) {
					
						this.active = true;
						callback()
					}
				}
				
				return this
			},
			
			//return Transfert associated to a given id
			get: function (id) { return $(id).retrieve(transport) },
										
			getSize: function(container) { 
				
				var size  = 0;
				(this.uploads[container] || []).each(function (transfer) { size += transfer.filesize });
				
				return size
			},

			//return a copy of the internal list
			getTransfers: function (container) { return (this.uploads[container] || []).concat() }
		},
		dragdrop = {
					
			dragenter: function(e) {
			
				e.stop();
				
				var el = this;
				
				co = el.getCoordinates();
				
				el.getFirst().setStyles({
											left: co.left,
											top: co.top, 
											width: co.width, 
											height: 24,
											backgroundColor: '#E1F1FD',
											textAlign: 'center',
											display: 'block',
											zIndex: 10
										}).tween('backgroundColor', '#1096E6')										
			},	
			
			dragexit: function(e) {
				
				e.stop(); 
				this.getFirst().style.display = 'none'
			},	
			
			dragover: function(e) { e.stop() },
			
			drop: function (e) {
			
				e.stop();
				
				var el = this, options = el.retrieve(store),
					transfer;
				
				el.getFirst().style.display = 'none';
				if(e.event.dataTransfer) Array.from(e.event.dataTransfer.files).each(function (f) { 
				
					transfer = uploadManager.upload(options);
					if(transfer) transfer.load(f) 
				})
			}
		},
		
		Transfert = new Class({
		
			filesize: 0,
			complete: false,
			initialize: function(options) {

				//file type filter
				if(options.filetype) this.addEvent('load',	function (object) { 
					
					var matches = options.filetype.split(/[^a-z0-9]/i); 
						
					if(!this.aborted && matches.length > 0) this.aborted = !new RegExp('(\.' + matches.join(')$|(\.') + '$)', 'i').test(object.file);
					if(this.aborted) this.message = 'unauthorized file type'
				});
					
				var element, container = options.container;
					
				this.addEvents({
		
						load: function () { uploadManager.actives[container].push(this) },
						
						success: function (json) {
								
							this.filesize = json.size;
							this.complete = true;
							uploadManager.actives[container].erase(this)
							
							var id = options.id,
								file = $(id + '_lfile').set({checked: true, value: json.path}),
								change = function () { file.checked = this.checked },
								checkbox = $(id).set({
										value: json.file,
										events: {
											
											change: change,
											click: change
										}
									});
									
								checkbox.style.display = '';
								checkbox.checked = true
						},
						
						cancel: function () {  
						
							uploadManager.uploads[container].erase(this)
							uploadManager.actives[container].erase(this)
						},
						
						complete: function () { 
						
							if(uploadManager.actives[container].length == 0 && uploadManager.queue[container].length == 0) {
							
								uploadManager.active = false;
								this.fireEvent('allComplete', container) 
							}
							else if(uploadManager.enqueue) {
							
								uploadManager.active = false;
								uploadManager.load(container)							
							}
						}
					}).setOptions(options);
				
				element = this.createElement(options);
				element.getElement('#' + options.id).store(transport, this);					
				element.getElement('a.cancel-upload').addEvent("click", function(e) { 
						
					e.stop(); 
					this.cancel() 
				}.bind(this))
			},
			
			createElement: function (options) {
			
				this.element = new Element('div', {'class': 'upload-container',
								html: '<iframe id="' + options.id + '_iframe" src="' + options.base + ( options.base.indexOf('?') == -1 ? '?' : '&') + options.id + '" frameborder="no" scrolling="no" style="border:0;overflow:hidden;padding:0;display:block;float:left;height:20px;width:228px; "></iframe>'
								+ '<input type="checkbox" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
								+ '<input type="checkbox" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
								+ '<span class="upload-span" id="' + options.id + '_label"><a class="cancel-upload" href="' + options.base + '">Cancel</a></span>'
							}).inject(options.container);
					
				return this.element
			},
			
			toElement: function () { return this.element },
			
			load: function (file) {
			
				this.aborted = false;
				this.fireEvent('load', {element: this.element, file: file, size: 0, transfer: this});
				if(this.aborted) this.fireEvent('abort', {file: file, message: this.message || '', transfer: this});
				delete this.message;
				return this;
			},
			
			cancel: function (message) {
			
				var complete = this.running;
				
				if(message) this.message = message;
				
				this.fireEvent('cancel', this);
				if(complete) this.fireEvent('complete', this);
				delete this.message;
				this.element.destroy()
			},
			
			Implements: [Options, Events]
		}),
		
		HTML5Transfert = new Class({
		
			Extends: Transfert,
			running: false,
			ready: false,
			reader: !!window.FileReader,
			initialize: function(options) {
					
				var xhr = this.xhr = new XMLHttpRequest();
				
				if(Browser.name == 'firefox' && Browser.version >= 4) this.addEvent('create', function (transfer) {
				
					var input = $(transfer).getElement('input[type=file]').setStyle('display', 'none');
					new Element('a', {text: 'Browse...', 'class': 'browse-upload', href: '#', events: {click: function (e) { e.stop(); input.click() }}}).inject(input, 'before')
				});
				
				this.addEvents({
				
					load: function (obj) {
					
						//file size limit check
						if(obj.size == 0) {
						
							this.message = 'The selected file is empty';
							this.aborted = true
						}
						
						//file size limit check
						else if(options.filesize > 0 && obj.size > options.filesize) {
						
							this.aborted = true;
							this.message = 'file too big (file size must not exceed ' + options.filesize.toFileSize() + ')'
						}
						
						else if(options.maxsize > 0 && uploadManager.getSize(options.container) + obj.size > options.maxsize) {
						
							this.aborted = true;
							this.message = 'file too big (total file size must not exceed ' + options.maxsize.toFileSize() + ')'
						}
					},
					
					success: function (json) { 
					
						var remove = json.remove;
						delete json.remove;
						
						this.addEvent('cancel', function () {
						
							var xhr = new XMLHttpRequest();
							
							xhr.open('GET', remove, true);
							xhr.setRequestHeader('Sender', 'XMLHttpRequest');
							xhr.send()
						})
					},
					
					cancel: function () {
				
						if(this.running) {
						
							this.xhr.abort();
							xhr = this.xhr = new XMLHttpRequest();
							this.running = false
						}
					}
								
				}).parent(options);
					
				this.binary = !!xhr.sendAsBinary;
					
				this.add(xhr.upload, 'progress', function(e) { if (e.lengthComputable) this.progress.setValue(e.loaded / e.total) }).						
					add(xhr, 'load', function() {

						var progress = $(this.progress.setValue(1)),
							self = this,
							options = this.options;
								
						(function () {
						
							progress.style.display = 'none';
							self.fields.getElement('label').set({text: self.filename.shorten() + ' (' + self.size.toFileSize() + ')', title: self.filename});
							self.fields.style.display = '';
							(function () { progress.destroy() }).delay(50)
						}).delay(10);
								
						if (xhr.readyState != 4) {
						
							this.fireEvent('failure', this).fireEvent('complete', this);
							return
						}
						
						var status, json, event = 'success';
						this.running = false;
						
						try { status = xhr.status } catch(e) {}
						
						//success
						if (status >= 200 && status < 300) {
						
							try { 
							
								json = JSON.decode(xhr.responseText);
								json.transfer = this;
								json.element = this.element;						
								if(json.size != this.size) event = 'failure'
							}					
							catch(e) { event = 'failure' }
							
						} else event = 'failure';
						
						this.fireEvent(event, event == 'failure' ? this : json).fireEvent('complete', this);

						if(json.size == 0) this.cancel('The selected file is empty');
						else if(options.filesize > 0 && json.size > options.filesize) this.cancel('file too big (file size must not exceed ' + options.filesize.toFileSize() + ')');
						else if(options.maxsize > 0 && uploadManager.getSize(options.container) > options.maxsize) this.cancel('file too big (total files size must not exceed ' + options.maxsize.toFileSize() + ')')						
					}).
					add(xhr, 'error', function() {

								this.span.style.display = 'none';
								this.fields.getElement('label').set('text', this.filename + '(Failed)')
							
							}.bind(this));
							
				if(this.reader) {
				
					var reader = this.reader = new FileReader();
						
					this.add(reader, 'load', function(e) { 
									this.bin = e.target.result; 
									this.ready = true 
								})
				}
			},
			
			createElement: function (options) {
			
				this.element = new Element('div', {
						'class': 'upload-container',
						html: '<div style="display:inline-block;padding:3px"><span style="display:none">&nbsp;</span><span><input id="' + options.id + '_input" type="file" name="' + options.id + '_input"' + (options.multiple ? ' multiple="multiple"' : '') + '/>'
						+ '<input type="checkbox" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
						+ '<input type="checkbox" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
						+ '<label for="'+ options.id + '"></label>'
						+ '</span></div><a class="cancel-upload" href="' + options.base + '">Cancel</a>'
					}).inject(options.container);
							
				var input = this.element.getElement('input[type=file]').addEvent('change', function (e) {
				
					var files = Array.from(e.target.files),
						transfer;
					
					this.load(files.shift());
					files.each(function (f) { 
						
						transfer = uploadManager.upload(options);
						if(transfer) transfer.load(f) 
					})
					
				}.bind(this));
								
				return this.addEvent('abort', function () { input.value = '' }).element
			},
			
			add: function (obj, event, fn) {
			
				fn = fn.bind(this);
				if(obj.addEventListener) obj.addEventListener(event, fn, false);
				else obj['on' + event] = fn;
				return this
			},

			load: function (file) {
				
				this.aborted = false;
				this.fireEvent('load', {element: this.element, file: file.name, size: file.size, transfer: this});
				
				if(this.aborted) {
				
					this.fireEvent('abort', {file: file, message: this.message || '', transfer: this});
					delete this.message;
					this.cancel();
					return this
				}
				
				this.file = file;
				this.size = file.size;
				this.filename = file.name;
				
				var first = this.element.getFirst(),
					span = first.getElement('span').setStyle('display', 'none');
				
				this.progress = new ProgressBar(Object.merge({
					
							container: first.set('title', file.name),
							text: file.name.shorten()
						}, this.options.progressbar));
					
				this.fields = span.getNext().setStyle('display', 'none');
				this.fields.getFirst().style.display = 'none';
				this.element.getElement('input[type=file]').destroy();	
				
				span.destroy();
				uploadManager.push(this.options.container, this.upload.bind(this));
				if(this.reader) this.reader.readAsBinaryString(file);
				return this
			},
			
			//this launch the transfer, to retry after a failure, just call it again
			initUpload: function () {
			
				var xhr = this.xhr;
				
				this.running = true;
				xhr.open('POST', this.options.base, true);
				xhr.setRequestHeader('Filename', this.filename);
				xhr.setRequestHeader('Sender', 'XMLHttpRequest');
				
				//FF
				if(this.binary) xhr.sendAsBinary(this.bin);
				else xhr.send(this.file)
			},
			
			upload: function () {
			
				if(this.reader) {
				
					if(this.ready) this.initUpload();
					else setTimeout(this.upload.bind(this), 100)
				} else this.initUpload()
			}
		});
		
		Object.append(Element.NativeEvents, {dragenter: 2, dragexit: 2, dragover: 2, drop: 2});
		div.destroy()	
})(document.id, this);
