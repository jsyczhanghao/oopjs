(function(exports){
	var 
	
	classCache = {},
	
	classId = 0;
	
	function each(obj, callback){
		for(var key in obj){
			if(obj.hasOwnProperty(key)){
				callback.call(obj, key, obj[key]);
			}
		} 
	}
	
	function override(name, func, type){
		return function(){
			var status = false, caller = arguments.callee.caller;

			while ( caller ) {
				if ( caller.$classid == this.$classid ) {
					status = true; break;
				}
				
				caller = caller.caller;
			}
			
			if ( !status ) {
				throw new Error(name + ' is ' + type + ' method!');	
			} 
			
			func.apply(this, arguments);		
		};
	}
	
	function extendMethods(prototype, pros, classid, constructor, isextend){
		if(pros.extend) {
			var extend_prototype = pros.extend.prototype;

			if( extend_prototype && !extend_prototype.$classid){
				throw new Error('extend is not a class!');	
			}	
	
			extendMethods(prototype, classCache[extend_prototype.$classid], classid, constructor, isextend);
		}
				
		each(pros, function(type, pro){
			var method;
			
			switch(type){			
				case 'extend': break;
				
				case 'private': 
					if(isextend) break;
					
				case 'protected':
					each(pro, function(key, item){
						method = prototype[key] = override(key, item, type);
					});
				
					break;
					
				case 'public':
					each(pro, function(key, item){
						method = prototype[key] = item;	
					});
					
					break;
					
				case 'static': 
					extendMethods(constructor, pro, classid);
					
					break;
					
				default: 
					method = prototype[type] = pro;
			};
			
			if(method) method.$classid = classid;
		});
	}
	
	exports.Class = function(pros){
		var f = function(){
			if (typeof this.initialize == 'function') this.initialize.apply(this, arguments);
		};
		
		var prototype = f.prototype, classid = ++classId;

		classCache[classid] = pros;
		
		extendMethods(prototype, pros, classid, f);	
		
		prototype.$classid = classid;

		return f;
	};
})(window);
