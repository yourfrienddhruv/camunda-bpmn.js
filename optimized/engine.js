/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var CAM={};(function(e){var t=function(){function e(e,t){throw this.message=e,this.activityExecution=t,e}return e}(),n={},r="start",i="end",s="take",o=function(e,t,n){var r=[];for(var i=0;i<e.baseElements.length;i++){var s=e.baseElements[i];!!s.type&&s.type==t&&(r.push(s),n&&(r=r.concat(o(s,t,n))))}return r},u=function(e,t){for(var n=0;n<e.baseElements.length;n++){var r=e.baseElements[n];if(!!r.id&&r.id==t)return r}return null},a=function(e){var t=e.type;return t?n[t]:null},f=function(e,t){var n=[];if(!!e.outgoing){var r=e.outgoing;for(var i=0;i<r.length;i++){var s=r[i];n.push(u(t,s))}}return n},l=function(){function e(e,n){if(!e)throw new t("Activity definition cannot be null",this);this.activityDefinition=e,this.activityExecutions=[],this.isEnded=!1,this.parentExecution=n,this.variables={},this.startDate=null,this.endDate=null}return e.prototype.bindVariableScope=function(e){!this.parentExecution||this.parentExecution.bindVariableScope(e);var t=this.variables;for(var n in t)e[n]=t[n]},e.prototype.executeActivities=function(e){for(var t=0;t<e.length;t++)this.executeActivity(e[t])},e.prototype.executeActivity=function(t,n){var r=new e(t,this);this.activityExecutions.push(r),!n||(r.incomingSequenceFlowId=n.id),r.start()},e.prototype.invokeListeners=function(e,t){var n=this.activityDefinition.listeners;if(!!n)for(var r=0;r<n.length;r++){var i=n[r];!i[e]||i[e](this,t)}},e.prototype.start=function(){this.startDate=new Date,this.invokeListeners(r),this.activityDefinition.asyncCallback?this.activityDefinition.asyncCallback(this):this.continue()},e.prototype.continue=function(){var e=a(this.activityDefinition);e.execute(this)},e.prototype.end=function(e){this.isEnded=!0,this.endDate=new Date,this.invokeListeners(i);if(!!this.parentExecution){var t=this.parentExecution;e&&t.hasEnded(this)}},e.prototype.takeAll=function(e){for(var t=0;t<e.length;t++)this.take(e[t])},e.prototype.take=function(e){var n=e.targetRef,r=u(this.parentExecution.activityDefinition,n);if(!r)throw new t("cannot find activity with id '"+n+"'");this.end(!1),this.invokeListeners(s,e),this.parentExecution.executeActivity(r,e)},e.prototype.signal=function(){if(this.isEnded)throw new t("cannot signal an ended activity instance",this);var e=a(this.activityDefinition);e.signal?e.signal(this):this.end()},e.prototype.hasEnded=function(e){var t=!0;for(var n;n<this.activityExecutions.length;n++)t&=this.activityExecutions[n].isEnded;if(t){var r=a(this.activityDefinition);r.allActivitiesEnded?r.allActivitiesEnded(this):this.end()}},e.prototype.getActivityInstance=function(){var e={activityId:this.activityDefinition.id,isEnded:this.isEnded,startDate:this.startDate,endDate:this.endDate};if(this.activityExecutions.length>0){e.activities=[];for(var t=0;t<this.activityExecutions.length;t++)e.activities.push(this.activityExecutions[t].getActivityInstance())}return e},e}();e.ActivityExecution=l,e.ExecutionException=t,e.activityTypes=n,e.getActivitiesByType=o,e.getActivityById=u,e.getActivityType=a,e.getSequenceFlows=f,e.LISTENER_START=r,e.LISTENER_END=i,e.LISTENER_TAKE=s})(CAM),function(CAM){function evaluateCondition(e,t){return(new VariableScope(t)).evaluateCondition(e)}function leave(e){var t=[],n=CAM.getSequenceFlows(e.activityDefinition,e.parentExecution.activityDefinition),r=e.activityDefinition.default,i=null,s=!0;for(var o=0;o<n.length;o++){var u=n[o];!r||r!=u.id?u.condition?evaluateCondition(u.condition,e)&&(t.push(u),s=!1):t.push(u):i=u}s&&!!i&&t.push(i),e.takeAll(t)}var VariableScope=function(){function VariableScope(e){e.bindVariableScope(this)}return VariableScope.prototype.evaluateCondition=function(condition){return eval(condition)},VariableScope}(),process={execute:function(e){var t=CAM.getActivitiesByType(e.activityDefinition,"startEvent");if(t.length==0)throw"process must have at least one start event";e.executeActivities(t)}},startEvent={execute:function(e){leave(e)}},intermediateThrowEvent={execute:function(e){leave(e)}},endEvent={execute:function(e){e.end(!0)}},task={execute:function(e){leave(e)}},userTask={execute:function(e){},signal:function(e){leave(e)}},serviceTask={execute:function(e){leave(e)}},exclusiveGateway={execute:function(e){var t=e.activityDefinition.sequenceFlows,n,r;for(var i=0;i<t.length;i++){var s=t[i];if(!s.condition)r=s;else if(evaluateCondition(s.condition,e)){n=s;break}}if(!n){if(!r)throw"Cannot determine outgoing sequence flow for exclusive gateway '"+e.activityDefinition+"': "+"All conditions evaluate to false and a default sequence flow has not been specified.";n=r}e.take(n)}},parallelGateway={execute:function(e){var t=CAM.getSequenceFlows(e.activityDefinition,e.parentExecution.activityDefinition),n=[],r=e.parentExecution;for(var i=0;i<r.activityExecutions.length;i++){var s=r.activityExecutions[i];s.activityDefinition==e.activityDefinition&&!s.isEnded&&n.push(s)}if(n.length==e.activityDefinition.cardinality){for(var i=0;i<n.length;i++){var o=n[i];o!=e&&o.end(!1)}e.takeAll(t)}}};CAM.activityTypes.startEvent=startEvent,CAM.activityTypes.intermediateThrowEvent=intermediateThrowEvent,CAM.activityTypes.endEvent=endEvent,CAM.activityTypes.exclusiveGateway=exclusiveGateway,CAM.activityTypes.task=task,CAM.activityTypes.userTask=userTask,CAM.activityTypes.serviceTask=serviceTask,CAM.activityTypes.process=process,CAM.activityTypes.parallelGateway=parallelGateway}(CAM),typeof define=="function"&&define("bpmn/Executor",[],function(){return CAM}),define("bpmn/Transformer",[],function(){function s(e){var t;if(window.DOMParser){var n=new DOMParser;t=n.parseFromString(e,"text/xml")}else t=new ActiveXObject("Microsoft.XMLDOM"),t.async=!1,t.loadXML(e);return t}function o(){}var e="http://www.omg.org/spec/BPMN/20100524/MODEL",t="http://www.omg.org/spec/BPMN/20100524/DI",n="http://www.omg.org/spec/DD/20100524/DC",r="http://www.omg.org/spec/DD/20100524/DI",i=[];return o.prototype.parseListeners=i,o.prototype.transform=function(n){function l(e,t,n){var r={};!t||t.baseElements.push(r);var i=e.attributes;r.type=e.localName;for(var s=0;i!=null&&s<i.length;s++){var o=i[s];r[o.nodeName]=o.nodeValue}if(r.type=="textAnnotation"){var u=e.getElementsByTagName("text")[0].firstChild.data;r.text=u}var a=n[r.id];return!a||(r.bpmndi=a),r.id||(r.id=r.type+"_"+f,f++),r}function c(e,t,n,r){var i=l(e,t,r);i.outgoing=[],i.listeners=[],i.properties={};var s=e.attributes;if(!!n){var o=n[i.id];if(!!o){for(var u=0;u<o.length;u++)i.outgoing.push(o[u].id);if(!!i.default&&a){var f=!1;for(var u=0;u<o.length;u++){var c=o[u];if(!!c.condition){if(i.defaultFlowId==c.id)throw"Sequence flow with id '"+c.id+"' is configured to be the default flow but has a condition";f=!0}}if(!f)throw"Activity with id '"+i.id+"' declares default flow with id '"+i.default+"' but has no conditional flows."}}}return i}function h(e,t,n,r){var i=c(e,t,n,r);return i}function p(e,t,n){var r=e.firstChild;do{var i=r.nodeName;i=="lane"&&l(r,t,n)}while(r=r.nextSibling)}function d(e,t,n,r){var i=c(e,t,n,r);i.eventDefinitions=[];var s=e.firstChild;if(!!s)do s.nodeName.indexOf("EventDefinition")!=-1&&i.eventDefinitions.push({type:s.nodeName});while(s=s.nextSibling);return i}function v(t,n,r,i){var s=l(t,n,r);!s.sourceRef||(i[s.sourceRef]||(i[s.sourceRef]=[]),i[s.sourceRef].push(s));var o=t.getElementsByTagNameNS(e,"conditionExpression");if(!!o&&o.length>0){var u=o[0];s.condition=u.textContent}return s.properties={},s}function m(e,t,n){e=e.firstChild;var r={};if(!e)return r;do(e.nodeName=="sequenceFlow"||e.localName=="sequenceFlow")&&v(e,t,n,r);while(e=e.nextSibling);return r}function g(e,t,n,r){var i=c(e,t,n,r),s=0;for(var o in n){var u=n[o];for(var a=0;a<u.length;a++)u[a].targetRef==i.id&&s++}return i.cardinality=s,i}function y(e,t,n,r){var i=c(e,t,null,r),s=i.sequenceFlows,o=i.default;if(!!n&&a){var s=n[i.id];!s||(i.sequenceFlows=s);if(!!s)if(s.length==1){if(!!s[0].condition)throw"If an exclusive Gateway has a single outgoing sequence flow, the sequence flow is not allowed to have a condition."}else if(s.length>1)for(var u=0;u<s.length;u++){var f=s[u];if(!f.condition){if(o!=f.id)throw"Sequence flow with id '"+f.id+"' has no conditions but it is not configured to be the default flow."}else if(!!o&&o==f.id)throw"Sequence flow with id '"+f.id+"' is configured to be the default flow but has a condition"}}return i}function b(e,t,n,r){for(var s=0;s<i.length;s++){var o=i[s];o(e,t,n,r)}}function w(e,t,n){t.baseElements=[];var r=m(e,t,n),i=e.firstChild;if(!i)return;do{var s=null,o=i.nodeName,u=["task","manualTask","serviceTask","scriptTask","userTask","sendTask","recieveTask","businessRuleTask"],a=["startEvent","endEvent","intermediateThrowEvent","intermediateCatchEvent","boundaryEvent"];o=="exclusiveGateway"?s=y(i,t,r,n):o=="parallelGateway"?s=g(i,t,r,n):u.indexOf(o)!=-1?s=h(i,t,r,n):a.indexOf(o)!=-1?s=d(i,t,r,n):o=="laneSet"?s=p(i,t,n):o=="subProcess"?s=S(i,t,r,n):!!i&&i.nodeName!="sequenceFlow"&&i.nodeType==1&&(s=l(i,t,n)),!s||b(s,i,t,e)}while(i=i.nextSibling)}function E(e,t){var n=c(e,null,null,t);n.isExecutable?a=n.isExecutable=="true":a=!1,w(e,n,t),u.push(n),b(n,e)}function S(e,t,n,r){var i=c(e,t,n,r);w(e,i,r),u.push(i),b(i,e)}function x(e,t){var n={};n.type=e.localName;for(var r=0;e.attributes!=null&&r<e.attributes.length;r++){var i=e.attributes.item(r);i.nodeName!="bpmnElement"&&(n[i.nodeName]=i.nodeValue)}var s=[],o=e.firstChild;if(!!o)do x(o,s);while(o=o.nextSibling);s.length>0&&(n.children=s),t.push(n)}function T(e,n){var r;!!e.namespaceURI&&e.namespaceURI==t&&(r=e.getAttribute("bpmnElement"));var i=e.firstChild;if(!!i)do if(e.localName=="BPMNDiagram"||e.localName=="BPMNPlane")T(i,n);else{var s=[];x(e,s),n[r]=s}while(i=i.nextSibling)}function N(n){var r=n.getElementsByTagNameNS(t,"BPMNDiagram"),i={};for(var s=0;s<r.length;s++)T(r[s],i);var o=n.getElementsByTagNameNS(e,"participant"),u={};if(o.length!=0)for(var a=0;a<o.length;a++){var f=o[a],l=f.getAttribute("processRef"),c=o[a].getAttribute("id");i[l]=i[c],u[l]=f.getAttribute("name")}var h=n.getElementsByTagNameNS(e,"process");for(var s=0;s<h.length;s++)h[s].setAttributeNS(e,"name",u[h[s].getAttribute("id")]),E(h[s],i)}var r=s(n),o=r.getElementsByTagNameNS(e,"definitions");if(o.length==0)throw"A BPMN 2.0 XML file must contain at least one definitions element";var u=[],a=!1,f=0;return N(o[0]),u},o}),define("bpmn/Engine",["bpmn/Executor","bpmn/Transformer"],function(e,t){return{startInstance:function(e,n,r){var i=new t;i.parseListeners=r;var s=i.transform(e),o=new CAM.ActivityExecution(s);o.variables=n,o.start()}}});