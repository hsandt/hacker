/**
 * dialogFx.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function DialogFx( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this.ctrlClose = this.el.querySelector( '[data-dialog-close]' );
		this.isOpen = false;
		this._initEvents();
	}

	DialogFx.prototype.options = {
		// callbacks
		onOpenDialog : function() { return false; },
		onCloseDialog : function() { return false; }
	}

	DialogFx.prototype._initEvents = function() {
		var self = this;

		// close action
		this.ctrlClose.addEventListener( 'click', this.close.bind(this) );

		// esc key closes dialog
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			if( keyCode === 27 && self.isOpen ) {
				self.close();
			}
		} );

		this.el.querySelector( '.dialog__overlay' ).addEventListener( 'click', this.close.bind(this) );
	}

	/* Modified by hsandt */
	DialogFx.prototype.toggle = function() {
		if( this.isOpen ) {
			this.close();
		}
		else {
			this.open();
		}
	};

	/* Added by hsandt */
	DialogFx.prototype.open = function() {
		if (this.isOpen) return;

		classie.add( this.el, 'dialog--open' );

		// callback on open
		this.options.onOpenDialog( this );

		this.isOpen = true;
	};

	/* Added by hsandt */
	DialogFx.prototype.close = function() {
		if (!this.isOpen) return;

		var self = this;
		classie.remove( this.el, 'dialog--open' );
		classie.add( self.el, 'dialog--close' );

		onEndAnimation( this.el.querySelector( '.dialog__content' ), function() {
			classie.remove( self.el, 'dialog--close' );
		} );

		// callback on close
		this.options.onCloseDialog( this );

		this.isOpen = false;
	};

	// add to global namespace
	window.DialogFx = DialogFx;

})( window );
