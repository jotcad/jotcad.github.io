function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var digest_min = {exports: {}};

/*! digest-js - v0.3.0 - 2015-09-13 */

var hasRequiredDigest_min;

function requireDigest_min () {
	if (hasRequiredDigest_min) return digest_min.exports;
	hasRequiredDigest_min = 1;
	(function (module, exports) {
		/*! ***** BEGIN LICENSE BLOCK *****
		 *!
		 *! Copyright 2011-2012, 2014 Jean-Christophe Sirot <sirot@chelonix.com>
		 *!
		 *! This file is part of digest.js
		 *!
		 *! digest.js is free software: you can redistribute it and/or modify it under
		 *! the terms of the GNU General Public License as published by the Free Software
		 *! Foundation, either version 3 of the License, or (at your option) any later
		 *! version.
		 *!
		 *! digest.js is distributed in the hope that it will be useful, but
		 *! WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
		 *! or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
		 *! more details.
		 *!
		 *! You should have received a copy of the GNU General Public License along with
		 *! digest.js. If not, see http://www.gnu.org/licenses/.
		 *!
		 *! ***** END LICENSE BLOCK *****  */
		!function(){ArrayBuffer.prototype.slice||(ArrayBuffer.prototype.slice=function(a,b){var c,d=new Uint8Array(this);void 0===b&&(b=d.length);var e=new ArrayBuffer(b-a),f=new Uint8Array(e);for(c=0;c<f.length;c++)f[c]=d[c+a];return e});}(),function(a){function b(){}function c(){}function d(){}b.prototype.processBlock=function(a){var b,c=this.current[0],d=this.current[1],e=this.current[2],f=this.current[3],g=a[3]<<24|a[2]<<16|a[1]<<8|a[0],h=a[7]<<24|a[6]<<16|a[5]<<8|a[4],i=a[11]<<24|a[10]<<16|a[9]<<8|a[8],j=a[15]<<24|a[14]<<16|a[13]<<8|a[12],k=a[19]<<24|a[18]<<16|a[17]<<8|a[16],l=a[23]<<24|a[22]<<16|a[21]<<8|a[20],m=a[27]<<24|a[26]<<16|a[25]<<8|a[24],n=a[31]<<24|a[30]<<16|a[29]<<8|a[28],o=a[35]<<24|a[34]<<16|a[33]<<8|a[32],p=a[39]<<24|a[38]<<16|a[37]<<8|a[36],q=a[43]<<24|a[42]<<16|a[41]<<8|a[40],r=a[47]<<24|a[46]<<16|a[45]<<8|a[44],s=a[51]<<24|a[50]<<16|a[49]<<8|a[48],t=a[55]<<24|a[54]<<16|a[53]<<8|a[52],u=a[59]<<24|a[58]<<16|a[57]<<8|a[56],v=a[63]<<24|a[62]<<16|a[61]<<8|a[60];b=c+g+3614090360+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+h+3905402710+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+i+606105819+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+j+3250441966+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+k+4118548399+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+l+1200080426+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+m+2821735955+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+n+4249261313+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+o+1770035416+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+p+2336552879+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+q+4294925233+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+r+2304563134+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+s+1804603682+(d&e|~d&f)|0,c=d+(b<<7|b>>>25)|0,b=f+t+4254626195+(c&d|~c&e)|0,f=c+(b<<12|b>>>20)|0,b=e+u+2792965006+(f&c|~f&d)|0,e=f+(b<<17|b>>>15)|0,b=d+v+1236535329+(e&f|~e&c)|0,d=e+(b<<22|b>>>10)|0,b=c+h+4129170786+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+m+3225465664+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+r+643717713+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+g+3921069994+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+l+3593408605+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+q+38016083+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+v+3634488961+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+k+3889429448+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+p+568446438+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+u+3275163606+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+j+4107603335+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+o+1163531501+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+t+2850285829+(f&d|~f&e)|0,c=d+(b<<5|b>>>27)|0,b=f+i+4243563512+(e&c|~e&d)|0,f=c+(b<<9|b>>>23)|0,b=e+n+1735328473+(d&f|~d&c)|0,e=f+(b<<14|b>>>18)|0,b=d+s+2368359562+(c&e|~c&f)|0,d=e+(b<<20|b>>>12)|0,b=c+l+4294588738+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+o+2272392833+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+r+1839030562+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+u+4259657740+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+h+2763975236+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+k+1272893353+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+n+4139469664+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+q+3200236656+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+t+681279174+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+g+3936430074+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+j+3572445317+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+m+76029189+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+p+3654602809+(d^e^f)|0,c=d+(b<<4|b>>>28)|0,b=f+s+3873151461+(c^d^e)|0,f=c+(b<<11|b>>>21)|0,b=e+v+530742520+(f^c^d)|0,e=f+(b<<16|b>>>16)|0,b=d+i+3299628645+(e^f^c)|0,d=e+(b<<23|b>>>9)|0,b=c+g+4096336452+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+n+1126891415+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+u+2878612391+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+l+4237533241+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+s+1700485571+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+j+2399980690+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+q+4293915773+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+h+2240044497+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+o+1873313359+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+v+4264355552+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+m+2734768916+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+t+1309151649+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,b=c+k+4149444226+(e^(d|~f))|0,c=d+(b<<6|b>>>26)|0,b=f+r+3174756917+(d^(c|~e))|0,f=c+(b<<10|b>>>22)|0,b=e+i+718787259+(c^(f|~d))|0,e=f+(b<<15|b>>>17)|0,b=d+p+3951481745+(f^(e|~c))|0,d=e+(b<<21|b>>>11)|0,this.current[0]+=c,this.current[1]+=d,this.current[2]+=e,this.current[3]+=f,this.currentLen+=64;},b.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=4294967295&a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-8]=255&c,e[e.length-7]=c>>>8&255,e[e.length-6]=c>>>16&255,e[e.length-5]=c>>>24&255,e[e.length-4]=255&b,e[e.length-3]=b>>>8&255,e[e.length-2]=b>>>16&255,e[e.length-1]=b>>>24&255,e},b.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(16));return a[0]=255&this.current[0],a[1]=this.current[0]>>>8&255,a[2]=this.current[0]>>>16&255,a[3]=this.current[0]>>>24&255,a[4]=255&this.current[1],a[5]=this.current[1]>>>8&255,a[6]=this.current[1]>>>16&255,a[7]=this.current[1]>>>24&255,a[8]=255&this.current[2],a[9]=this.current[2]>>>8&255,a[10]=this.current[2]>>>16&255,a[11]=this.current[2]>>>24&255,a[12]=255&this.current[3],a[13]=this.current[3]>>>8&255,a[14]=this.current[3]>>>16&255,a[15]=this.current[3]>>>24&255,a.buffer},b.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(16)),this.current[0]=1732584193,this.current[1]=4023233417,this.current[2]=2562383102,this.current[3]=271733878;},b.prototype.blockLen=64,b.prototype.digestLen=16,c.prototype.processBlock=function(a){var b,c,d=this.current[0],e=this.current[1],f=this.current[2],g=this.current[3],h=this.current[4],i=[a[0]<<24|a[1]<<16|a[2]<<8|a[3],a[4]<<24|a[5]<<16|a[6]<<8|a[7],a[8]<<24|a[9]<<16|a[10]<<8|a[11],a[12]<<24|a[13]<<16|a[14]<<8|a[15],a[16]<<24|a[17]<<16|a[18]<<8|a[19],a[20]<<24|a[21]<<16|a[22]<<8|a[23],a[24]<<24|a[25]<<16|a[26]<<8|a[27],a[28]<<24|a[29]<<16|a[30]<<8|a[31],a[32]<<24|a[33]<<16|a[34]<<8|a[35],a[36]<<24|a[37]<<16|a[38]<<8|a[39],a[40]<<24|a[41]<<16|a[42]<<8|a[43],a[44]<<24|a[45]<<16|a[46]<<8|a[47],a[48]<<24|a[49]<<16|a[50]<<8|a[51],a[52]<<24|a[53]<<16|a[54]<<8|a[55],a[56]<<24|a[57]<<16|a[58]<<8|a[59],a[60]<<24|a[61]<<16|a[62]<<8|a[63]];for(c=16;80>c;c++)i.push((i[c-3]^i[c-8]^i[c-14]^i[c-16])<<1|(i[c-3]^i[c-8]^i[c-14]^i[c-16])>>>31);for(c=0;80>c;c++)b=(d<<5|d>>>27)+h+i[c],b+=20>c?(e&f|~e&g)+1518500249|0:40>c?(e^f^g)+1859775393|0:60>c?(e&f|e&g|f&g)+2400959708|0:(e^f^g)+3395469782|0,h=g,g=f,f=e<<30|e>>>2,e=d,d=b;this.current[0]+=d,this.current[1]+=e,this.current[2]+=f,this.current[3]+=g,this.current[4]+=h,this.currentLen+=64;},c.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=4294967295&a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-1]=255&c,e[e.length-2]=c>>>8&255,e[e.length-3]=c>>>16&255,e[e.length-4]=c>>>24&255,e[e.length-5]=255&b,e[e.length-6]=b>>>8&255,e[e.length-7]=b>>>16&255,e[e.length-8]=b>>>24&255,e},c.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(20));return a[3]=255&this.current[0],a[2]=this.current[0]>>>8&255,a[1]=this.current[0]>>>16&255,a[0]=this.current[0]>>>24&255,a[7]=255&this.current[1],a[6]=this.current[1]>>>8&255,a[5]=this.current[1]>>>16&255,a[4]=this.current[1]>>>24&255,a[11]=255&this.current[2],a[10]=this.current[2]>>>8&255,a[9]=this.current[2]>>>16&255,a[8]=this.current[2]>>>24&255,a[15]=255&this.current[3],a[14]=this.current[3]>>>8&255,a[13]=this.current[3]>>>16&255,a[12]=this.current[3]>>>24&255,a[19]=255&this.current[4],a[18]=this.current[4]>>>8&255,a[17]=this.current[4]>>>16&255,a[16]=this.current[4]>>>24&255,a.buffer},c.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(20)),this.current[0]=1732584193,this.current[1]=4023233417,this.current[2]=2562383102,this.current[3]=271733878,this.current[4]=3285377520;},c.prototype.blockLen=64,c.prototype.digestLen=20,d.prototype.processBlock=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t=this.current[0],u=this.current[1],v=this.current[2],w=this.current[3],x=this.current[4],y=this.current[5],z=this.current[6],A=this.current[7];d=a[0]<<24|a[1]<<16|a[2]<<8|a[3],e=a[4]<<24|a[5]<<16|a[6]<<8|a[7],f=a[8]<<24|a[9]<<16|a[10]<<8|a[11],g=a[12]<<24|a[13]<<16|a[14]<<8|a[15],h=a[16]<<24|a[17]<<16|a[18]<<8|a[19],i=a[20]<<24|a[21]<<16|a[22]<<8|a[23],j=a[24]<<24|a[25]<<16|a[26]<<8|a[27],k=a[28]<<24|a[29]<<16|a[30]<<8|a[31],l=a[32]<<24|a[33]<<16|a[34]<<8|a[35],m=a[36]<<24|a[37]<<16|a[38]<<8|a[39],n=a[40]<<24|a[41]<<16|a[42]<<8|a[43],o=a[44]<<24|a[45]<<16|a[46]<<8|a[47],p=a[48]<<24|a[49]<<16|a[50]<<8|a[51],q=a[52]<<24|a[53]<<16|a[54]<<8|a[55],r=a[56]<<24|a[57]<<16|a[58]<<8|a[59],s=a[60]<<24|a[61]<<16|a[62]<<8|a[63];for(var B=[d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s],C=16;64>C;C++)B.push(((B[C-2]>>>17|B[C-2]<<15)^(B[C-2]>>>19|B[C-2]<<13)^B[C-2]>>>10)+B[C-7]+((B[C-15]>>>7|B[C-15]<<25)^(B[C-15]>>>18|B[C-15]<<14)^B[C-15]>>>3)+B[C-16]|0);for(var D=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],E=0;64>E;E++)b=A+((x>>>6|x<<26)^(x>>>11|x<<21)^(x>>>25|x<<7))+(x&y^~x&z)+D[E]+B[E]|0,c=((t>>>2|t<<30)^(t>>>13|t<<19)^(t>>>22|t<<10))+(t&u^u&v^t&v)|0,A=z,z=y,y=x,x=w+b|0,w=v,v=u,u=t,t=b+c|0;this.current[0]+=t,this.current[1]+=u,this.current[2]+=v,this.current[3]+=w,this.current[4]+=x,this.current[5]+=y,this.current[6]+=z,this.current[7]+=A,this.currentLen+=64;},d.prototype.doPadding=function(){var a=8*(this.inLen+this.currentLen),b=0,c=0|a,d=this.inLen<=55?55-this.inLen:119-this.inLen,e=new Uint8Array(new ArrayBuffer(d+1+8));return e[0]=128,e[e.length-1]=255&c,e[e.length-2]=c>>>8&255,e[e.length-3]=c>>>16&255,e[e.length-4]=c>>>24&255,e[e.length-5]=255&b,e[e.length-6]=b>>>8&255,e[e.length-7]=b>>>16&255,e[e.length-8]=b>>>24&255,e},d.prototype.getDigest=function(){var a=new Uint8Array(new ArrayBuffer(32));return a[3]=255&this.current[0],a[2]=this.current[0]>>>8&255,a[1]=this.current[0]>>>16&255,a[0]=this.current[0]>>>24&255,a[7]=255&this.current[1],a[6]=this.current[1]>>>8&255,a[5]=this.current[1]>>>16&255,a[4]=this.current[1]>>>24&255,a[11]=255&this.current[2],a[10]=this.current[2]>>>8&255,a[9]=this.current[2]>>>16&255,a[8]=this.current[2]>>>24&255,a[15]=255&this.current[3],a[14]=this.current[3]>>>8&255,a[13]=this.current[3]>>>16&255,a[12]=this.current[3]>>>24&255,a[19]=255&this.current[4],a[18]=this.current[4]>>>8&255,a[17]=this.current[4]>>>16&255,a[16]=this.current[4]>>>24&255,a[23]=255&this.current[5],a[22]=this.current[5]>>>8&255,a[21]=this.current[5]>>>16&255,a[20]=this.current[5]>>>24&255,a[27]=255&this.current[6],a[26]=this.current[6]>>>8&255,a[25]=this.current[6]>>>16&255,a[24]=this.current[6]>>>24&255,a[31]=255&this.current[7],a[30]=this.current[7]>>>8&255,a[29]=this.current[7]>>>16&255,a[28]=this.current[7]>>>24&255,a.buffer},d.prototype.reset=function(){this.currentLen=0,this.inLen=0,this.current=new Uint32Array(new ArrayBuffer(32)),this.current[0]=1779033703,this.current[1]=3144134277,this.current[2]=1013904242,this.current[3]=2773480762,this.current[4]=1359893119,this.current[5]=2600822924,this.current[6]=528734635,this.current[7]=1541459225;},d.prototype.blockLen=64,d.prototype.digestLen=32;var e=function(a){var b,c=new ArrayBuffer(a.length),d=new Uint8Array(c);for(b=0;b<a.length;b++)d[b]=a.charCodeAt(b);return d},f=function(a){var b=new ArrayBuffer(1),c=new Uint8Array(b);return c[0]=a,c},g=function(a){if(a.constructor===Uint8Array)return a;if(a.constructor===ArrayBuffer)return new Uint8Array(a);if(a.constructor===String)return e(a);if(a.constructor===Number){if(a>255)throw "For more than one byte, use an array buffer";if(0>a)throw "Input value must be positive";return f(a)}throw "Unsupported type"},h=function(a){var b=new Uint8Array(new ArrayBuffer(4));return b[0]=(4278190080&a)>>24,b[1]=(16711680&a)>>16,b[2]=(65280&a)>>8,b[3]=255&a,b},i=function(a){var b=function(a){for(var b=a.length,c=0;b>0;){var d=this.blockLen-this.inLen;d>b&&(d=b);var e=a.subarray(c,c+d);this.inbuf.set(e,this.inLen),c+=d,b-=d,this.inLen+=d,this.inLen===this.blockLen&&(this.processBlock(this.inbuf),this.inLen=0);}},c=function(){var a=this.doPadding();this.update(a);var b=this.getDigest();return this.reset(),b},d=function(){if(!a)throw "Unsupported algorithm: "+a.toString();a.prototype.update=b,a.prototype.finalize=c;var d=new a;return d.inbuf=new Uint8Array(new ArrayBuffer(d.blockLen)),d.reset(),d}();return {update:function(a){d.update(g(a));},finalize:function(){return d.finalize()},digest:function(a){return d.update(g(a)),d.finalize()},reset:function(){d.reset();},digestLength:function(){return d.digestLen}}},j=function(a){var b,c,d,e=false,f=function(){var f,g;if(!e){if(void 0===b)throw "MAC key is not defined";for(g=b.byteLength>64?new Uint8Array(a.digest(b)):new Uint8Array(b),c=new Uint8Array(new ArrayBuffer(64)),f=0;f<g.length;f++)c[f]=54^g[f];for(f=g.length;64>f;f++)c[f]=54;for(d=new Uint8Array(new ArrayBuffer(64)),f=0;f<g.length;f++)d[f]=92^g[f];for(f=g.length;64>f;f++)d[f]=92;e=true,a.update(c.buffer);}},h=function(){e=false,b=void 0,c=void 0,d=void 0,a.reset();},i=function(){var b=a.finalize();return a.reset(),a.update(d.buffer),a.update(b),b=a.finalize(),h(),b},j=function(a){b=a;};return {setKey:function(a){j(g(a)),f();},update:function(b){a.update(b);},finalize:function(){return i()},mac:function(a){return this.update(a),this.finalize()},reset:function(){h();},hmacLength:function(){return a.digestLength()}}},k=function(a,b){var c=function(c,d,e){var f,g;if(e>a.digestLength())throw "Key length larger than digest length";for(a.reset(),a.update(c),a.update(d),g=a.finalize(),f=1;b>f;f++)g=a.digest(g);return g.slice(0,e)};return {deriveKey:function(a,b,d){return c(g(a),g(b),d)}}},l=function(a,b){var c=function(a,b){var c;for(c=0;c<a.length;c++)a[c]=a[c]^b[c];return a},d=function(b,d,e,f){var g,i=new Uint8Array(new ArrayBuffer(a.hmacLength())),j=new Uint8Array(new ArrayBuffer(d.length+4));for(j.set(d,0),j.set(h(f),d.length),g=1;e>=g;g++)a.setKey(b),a.update(j),j=new Uint8Array(a.finalize()),i=c(i,j);return i},e=function(c,e,f){var g,h,i;if(f>4294967295*a.hmacLength())throw "Derived key length too long";for(h=Math.ceil(f/a.hmacLength()),i=new Uint8Array(new ArrayBuffer(f*a.hmacLength())),g=1;h>=g;g++)i.set(d(c,e,b,g),a.hmacLength()*(g-1));return i.buffer.slice(0,f)};return {deriveKey:function(a,b,c){return e(g(a),g(b),c)}}},m={SHA1:function(){return i(c)},MD5:function(){return i(b)},SHA256:function(){return i(d)},HMAC_SHA1:function(){return j(i(c))},HMAC_MD5:function(){return j(i(b))},HMAC_SHA256:function(){return j(i(d))},PBKDF1_SHA1:function(a){return k(i(c),a)},PBKDF1_MD5:function(a){return k(i(b),a)},PBKDF2_HMAC_SHA1:function(a){return l(j(i(c)),a)},PBKDF2_HMAC_SHA256:function(a){return l(j(i(d)),a)}};module.exports?module.exports=m:m;}(); 
	} (digest_min));
	return digest_min.exports;
}

var digest_minExports = requireDigest_min();
var Digest = /*@__PURE__*/getDefaultExportFromCjs(digest_minExports);

/*
 * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};

const hashObject = (object, hash) => {
  if (object.hash) {
    hash.update('hash');
    hash.update(object.hash);
    return;
  }
  const keys = Object.keys(object);
  keys.sort();
  for (const key of keys) {
    if (typeof key === 'symbol' || object[key] === undefined) {
      continue;
    }
    hash.update(key);
    hashValue(object[key], hash);
  }
};

const hashArray = (array, hash) => {
  for (const value of array) {
    hashValue(value, hash);
  }
};

const hashValue = (value, hash) => {
  if (value === undefined) {
    hash.update('undefined');
  } else if (value === null) {
    hash.update('null');
  } else if (value instanceof Array) {
    hash.update('array');
    hashArray(value, hash);
  } else if (value instanceof Object) {
    hash.update('object');
    hashObject(value, hash);
  } else if (typeof value === 'number') {
    hash.update('number');
    hash.update(value.toString());
  } else if (typeof value === 'string') {
    hash.update('string');
    hash.update(value);
  } else if (typeof value === 'boolean') {
    hash.update('bool');
    hash.update(value ? 'true' : 'false');
  } else {
    throw Error(`Unexpected hashValue value ${value}`);
  }
};

const computeHash = (value) => {
  const hash = new Digest.SHA256('sha256');
  hashValue(value, hash);
  return encode(hash.finalize());
};

let ops;

const symbolPrefix = '\uE000 ';

const isSymbol = (string) =>
  typeof string === 'string' && string.startsWith(symbolPrefix);
const makeSymbol = (string) => symbolPrefix + string;

const beginOps = () => {
  ops = [];
  return ops;
};

const endOps = () => {
  const result = ops;
  ops = undefined;
  return result;
};

const emitOp = (op) => {
  ops.push(op);
  return op;
};

class Op {
  static specs = {};
  static code = {};
  static specHandlers = [];

  constructor(node) {
    this.node = node;
    this.node.output = null;
  }

  getId() {
    if (this.node.output === null) {
      this.node.output = makeSymbol(computeHash(this.node));
    }
    return this.node.output;
  }

  getInput() {
    return this.node.input;
  }

  setInput(input) {
    this.node.input = input;
    return this;
  }

  getOutput() {
    return this.getId();
  }

  getOutputType() {
    const [, , outputType] = Op.specs[this.node.name];
    return outputType;
  }

  getNode() {
    return this.node;
  }

  static registerOp(name, specs, code) {
    const { [name]: method } = {
      [name]: function (...args) {
        const input = this ? this.getId() : null;
        const destructuredArgs = Op.destructure(name, specs, input, args);
        return emitOp(new Op({ name, input, args: destructuredArgs }));
      },
    };
    Op.prototype[name] = method;
    Op.code[name] = code;
    Op.specs[name] = specs;
    return method;
  }

  static registerSpecHandler(code) {
    Op.specHandlers.push(code);
    return code;
  }

  static resolveOp(input, value) {
    // If we have Foo(Bar().Qux()) then Bar() will lack its input.
    // Set the input of Bar() in this case to be the input
    // of Foo so that it has the right context.
    //
    // However, note that Qux() should already have its input as
    // Bar() which should not be overridden.
    if (value instanceof Op) {
      if (value.getInput()) {
        return value;
      } else {
        return value.setInput(input).getId();
      }
    } else if (value instanceof Array) {
      return value.map((item) => Op.resolveOp(input, item));
    } else if (value instanceof Object) {
      const resolved = {};
      for (const key of Object.keys(value)) {
        resolved[key] = Op.resolveOp(input, value[key]);
      }
      return resolved;
    } else {
      return value;
    }
  }

  static destructure(name, specs, input, args) {
    const [inputSpec, argSpecs, outputSpec] = specs;
    const destructured = [];
    for (const spec of argSpecs) {
      const rest = [];
      let found = false;
      for (const specHandler of Op.specHandlers) {
        const handler = specHandler(spec);
        if (!handler) {
          continue;
        }
        const value = handler(spec, input, args, rest);
        const resolvedValue = Op.resolveOp(input, value);
        destructured.push(resolvedValue);
        args = rest;
        found = true;
        break;
      }
      if (!found) {
        throw new Error(
          `Cannot destructure: spec=${spec} args=${JSON.stringify(args)}`
        );
      }
      args = rest;
    }
    return destructured;
  }
}

const specEquals = (a, b) => {
  if (a === b) {
    return true;
  } else if (
    a instanceof Array &&
    b instanceof Array &&
    a.length === b.length
  ) {
    for (let nth = 0; nth < a.length; nth++) {
      if (a[nth] !== b[nth]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

const predicateValueHandler = (name, predicate) => (spec) =>
  spec === name &&
  ((spec, input, args, rest) => {
    let result;
    while (args.length >= 1) {
      const arg = args.shift();
      if (
        predicate(arg) ||
        (arg instanceof Op && specEquals(arg.getOutputType(), spec))
      ) {
        result = arg;
        break;
      }
      rest.push(arg);
    }
    rest.push(...args);
    return result;
  });

const resolve = async (context, graph, ops) => {
  let ready;
  const isReady = new Promise((resolve, reject) => {
    ready = resolve;
  });
  if (ops === undefined) {
    throw Error('resolve: ops=undefined');
  }
  for (const op of ops) {
    const node = op.getNode();
    if (graph[op.getOutput()] !== undefined) {
      // This node has already been computed.
      continue;
    }
    const dd = JSON.stringify(op);
    const promise = new Promise(async (resolve, reject) => {
      await isReady;
      const name = node.name;
      const evaluatedInput = await graph[node.input];
      const evaluateArgs = async (args) => {
        const evaluatedArgs = [];
        for (const value of args) {
          if (isSymbol(value)) {
            evaluatedArgs.push(await graph[value]);
          } else if (value instanceof Op) {
            evaluatedArgs.push(await graph[value.getOutput()]);
          } else if (value instanceof Array) {
            evaluatedArgs.push(await evaluateArgs(value));
          } else {
            evaluatedArgs.push(await value);
          }
        }
        return evaluatedArgs;
      };
      const evaluatedArgs = await evaluateArgs(node.args);
      try {
        const result = Op.code[name](context, evaluatedInput, ...evaluatedArgs);
        resolve(result);
      } catch (e) {
        throw e;
      }
    });
    promise.name = dd;
    graph[op.getOutput()] = promise;
  }
  ready();
  for (const [key, value] of Object.entries(graph)) {
    graph[key] = await value;
  }
};

const run = async (context, code) => {
  const graph = {};
  beginOps();
  await code();
  await resolve(context, graph, ops);
  endOps();
  return graph;
};

export { Op, beginOps, endOps, isSymbol, predicateValueHandler, resolve, run, specEquals };
