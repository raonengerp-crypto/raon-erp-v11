export const store={sites:[{id:1,name:'여수 OO상가',contract:55000000,paid:30000000,cost:42550000,schedule:'기계설치'}],quotes:[],materials:[],tax:{sales:[],purchases:[],cards:[]}};
export const won=n=>(Math.floor((Number(n)||0)/1000)*1000).toLocaleString('ko-KR')+' 원';
export const cut1000=n=>Math.floor((Number(n)||0)/1000)*1000;
