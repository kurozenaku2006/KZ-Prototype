function exportMethods(){

return {

exportClaimsCSV(type){

let data=this.claims;

if(type!=='all'){

data=data.filter(
c=>c.status===type
);

}

if(data.length===0){

this.showToast(
'warning',
'NO DATA',
'No claims available for export'
);

return;

}

const headers=[

'Customer Name',
'Phone',
'Email',
'Address',
'Product',
'Price',
'Status'

];

const rows=data.map(claim=>[

`"${claim.customerName||''}"`,
`"${claim.phone||''}"`,
`"${claim.contact||''}"`,
`"${claim.address||''}"`,
`"${claim.productName||''}"`,
`"${claim.price||0}"`,
`"${claim.status||''}"`

]);

const csvContent=[

headers.join(','),
...rows.map(r=>r.join(','))

].join('\n');

const blob=new Blob(
[csvContent],
{
type:'text/csv;charset=utf-8;'
}
);

const link=
document.createElement('a');

const url=
URL.createObjectURL(blob);

link.href=url;

link.download=
`claims-${type}-${Date.now()}.csv`;

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

this.showToast(
'success',
'CSV EXPORTED',
`${data.length} claims exported`
);

}

};

}
