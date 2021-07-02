import EventRecorder from "./EventRecorder"
declare var window: any;

const my = new EventRecorder();

console.log(my._initializeRecorder())

window.my = my;