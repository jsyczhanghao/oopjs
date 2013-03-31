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
	
	function classIdInChian(cid, pid, type){
		if(cid && pid){
			return cid == pid ? true : type != 'private' ? classIdInChian(classCache[cid].pid, pid, type) : false;
		}
		
		return false;
	}
	
	function override(name, func, classid, type){
		return function(){
			var status = false, caller = arguments.callee.caller;

			while(caller){
				if(classIdInChian(caller.$classid, classid, type)){
					status = true; break;
				}
				
				caller = caller.caller;
			}
			
			if(!status){
				throw new Error(name + ' is ' + type + ' method!');	
			} 
			
			return func.apply(this, arguments);		
		};
	}
	
	function extendMethods(prototype, pros, classid, constructor, isextend){
		var extend;
		
		if(extend = pros.extend) {
			var extend_prototype = extend.prototype;

			if(extend_prototype && !extend_prototype.$classid){
				throw new Error('extend is not a class!');	
			}	
	
			extendMethods(prototype, classCache[extend_prototype.$classid].pros, classid, constructor, isextend);
			
			classCache[classid].pid = extend_prototype.$classid;
		}
				
		each(pros, function(type, pro){
			var method;
			
			switch(type){			
				case 'extend': break;
				
				case 'private': 
					if(isextend) break;
					
				case 'protected':
					each(pro, function(key, item){
						method = prototype[key] = override(key, item, classid, type);
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
		var constructor = function(){
			if(typeof this.initialize == 'function') this.initialize.apply(this, arguments);
		};
		
		var prototype = constructor.prototype, classid = ++classId;

		classCache[classid] = {pros: pros, pid: 0};
		
		extendMethods(prototype, pros, classid, constructor);

		prototype.$classid = classid;

		return constructor;
	};
})(window);

