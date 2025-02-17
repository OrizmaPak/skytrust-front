/* 
    Object key is the id of the  menu selector
    template: is the html template name.
    startingFunction: function to call when page opens 

*/

const routerTree = {
  // template: {
  //     template: 'template',
  //     startingFunction: 'templateActive',
  //     scriptName: `./js/template.js?q=${Math.random()}`
  // },
  profile: {
    template: "profile",
    startingFunction: "profileActive",
    scriptName: `./js/profile.js?q=${Math.random()}`,
  },
  changepassword: {
    template: "changepassword",
    startingFunction: "changepasswordActive",
    scriptName: `./js/changepassword.js?q=${Math.random()}`,
  },
  dashboard: {
    template: "dashboard",
    startingFunction: "dashboardActive",
    scriptName: `./js/dashboard.js?q=${Math.random()}`,
  },
  branchmanagement: {
    template: "branchmanagement",
    startingFunction: "branchActive",
    scriptName: `./js/branchmanagement.js?q=${Math.random()}`,
  },
  onlineusers: {
    template: "onlineusers",
    startingFunction: "onlineusersActive",
    scriptName: `./js/onlineusers.js?q=${Math.random()}`,
  },
  cashierlimit: {
    template: "cashierlimit",
    startingFunction: "cashierlimitActive",
    scriptName: `./js/cashierlimit.js?q=${Math.random()}`,
  },
  taskmanagement: {
    template: "taskmanagement",
    startingFunction: "taskmanagementActive",
    scriptName: `./js/taskmanagement.js?q=${Math.random()}`,
  },
  registrationpoint: {
    template: "registrationpoint",
    startingFunction: "registrationpointActive",
    scriptName: `./js/registrationpoint.js?q=${Math.random()}`,
  },
  rejecttransactiondate: {
    template: "rejecttransactiondate",
    startingFunction: "rejecttransactiondateActive",
    scriptName: `./js/rejecttransactiondate.js?q=${Math.random()}`,
  },
  permissionsettings: {
    template: "permissionsettings",
    startingFunction: "permissionsettingsActive",
    scriptName: `./js/permissionsettings.js?q=${Math.random()}`,
  },
  department: {
    template: "department",
    startingFunction: "departmentActive",
    scriptName: `./js/department.js?q=${Math.random()}`,
  },

  definemembership: {
    template: "definemembership",
    startingFunction: "definemembershipActive",
    scriptName: `./js/definemembership.js?q=${Math.random()}`,
  },
    definemembership: {
        template: 'definemembership',
        startingFunction: 'definemembershipActive',
        scriptName: `./js/definemembership.js?q=${Math.random()}`
    },
   
    positionmembership: {
        template: 'positionmembership',
        startingFunction: 'positionmembershipActive',
        scriptName: `./js/positionmembership.js?q=${Math.random()}`
    },
    account: {
        template: 'account',
        startingFunction: 'accountActive',
        scriptName: `./js/account.js?q=${Math.random()}`
    },
    activity: {
        template: 'activity',
        startingFunction: 'activityActive',
        scriptName: `./js/activity.js?q=${Math.random()}`
    },
    organizationsettings: {
        template: 'organizationsettings',
        startingFunction: 'organizationsettingsActive',
        scriptName: `./js/organizationsettings.js?q=${Math.random()}`
    },
    createinventory: {
        template: 'createinventory',
        startingFunction: 'createinventoryActive',
        scriptName: `./js/createinventory.js?q=${Math.random()}`
    },
    viewinventory: {
        template: 'viewinventory',
        startingFunction: 'viewinventoryActive',
        scriptName: `./js/viewinventory.js?q=${Math.random()}`
    },
    openingstock: {
        template: 'openingstock',
        startingFunction: 'openingstockActive',
        scriptName: `./js/openingstock.js?q=${Math.random()}`
    },
    updateinventory: {
        template: 'updateinventory',
        startingFunction: 'updateinventoryActive',
        scriptName: `./js/updateinventory.js?q=${Math.random()}`
    },
    requisition: {
        template: 'requisition',
        startingFunction: 'requisitionActive',
        scriptName: `./js/requisition.js?q=${Math.random()}`
    },
    viewrequisition: {
        template: 'viewrequisition',
        startingFunction: 'viewrequisitionActive',
        scriptName: `./js/viewrequisition.js?q=${Math.random()}`
    },
    approveinrequisition: {
        template: 'approveinrequisition',
        startingFunction: 'approveinrequisitionActive',
        scriptName: `./js/approveinrequisition.js?q=${Math.random()}`
    },
    inrequisition: {
        template: 'inrequisition',
        startingFunction: 'inrequisitionActive',
        scriptName: `./js/inrequisition.js?q=${Math.random()}`
    },
    viewinrequisition: {
        template: 'viewinrequisition',
        startingFunction: 'viewinrequisitionActive',
        scriptName: `./js/viewinrequisition.js?q=${Math.random()}`
    },
    approverequisition: {
        template: 'approverequisition',
        startingFunction: 'approverequisitionActive',
        scriptName: `./js/approverequisition.js?q=${Math.random()}`
    },
    issuetype: {
        template: 'issuetype',
        startingFunction: 'issuetypeActive',
        scriptName: `./js/issuetype.js?q=${Math.random()}`
    },
    issuelog: {
        template: 'issuelog',
        startingFunction: 'issuelogActive',
        scriptName: `./js/issuelog.js?q=${Math.random()}`
    },
    viewreturneditems: {
        template: 'viewreturneditems',
        startingFunction: 'viewreturneditemsActive',
        scriptName: `./js/viewreturneditems.js?q=${Math.random()}`
    },
    stockhistory: {
        template: 'stockhistory',
        startingFunction: 'stockhistoryActive',
        scriptName: `./js/stockhistory.js?q=${Math.random()}`
    },
    stockvaluation: {
        template: 'stockvaluation',
        startingFunction: 'stockvaluationActive',
        scriptName: `./js/stockvaluation.js?q=${Math.random()}`
    },
    addmember: {
        template: 'addmember',
        startingFunction: 'addmemberActive',
        scriptName: `./js/addmember.js?q=${Math.random()}`
    },
    yourreferrals: {
        template: 'yourreferrals',
        startingFunction: 'yourreferralsActive',
        scriptName: `./js/yourreferrals.js?q=${Math.random()}`
    },
    regpointreferrals: {
        template: 'regpointreferrals',
        startingFunction: 'regpointreferralsActive',
        scriptName: `./js/regpointreferrals.js?q=${Math.random()}`
    },
    viewmembers: {
        template: 'viewmembers',
        startingFunction: 'viewmembersActive',
        scriptName: `./js/viewmembers.js?q=${Math.random()}`
    },
    managemembership: {
        template: 'managemembership',
        startingFunction: 'managemembershipActive',
        scriptName: `./js/managemembership.js?q=${Math.random()}`
    },
    savingsproduct: {
        template: 'savingsproduct',
        startingFunction: 'savingsproductActive',
        scriptName: `./js/savingsproduct.js?q=${Math.random()}`
    },
    savingaccount: {
        template: 'savingaccount',
        startingFunction: 'savingaccountActive',
        scriptName: `./js/savingaccount.js?q=${Math.random()}`
    },
    loanfees: {
        template: 'loanfees',
        startingFunction: 'loanfeesActive',
        scriptName: `./js/loanfees.js?q=${Math.random()}`
    },
    loanproduct: {
        template: 'loanproduct',
        startingFunction: 'loanproductActive',
        scriptName: `./js/loanproduct.js?q=${Math.random()}`
    },
    loanaccount: {
        template: 'loanaccount',
        startingFunction: 'loanaccountActive',
        scriptName: `./js/loanaccount.js?q=${Math.random()}`
    },
  loancollateral: {
    template: "loancollateral",
    startingFunction: "loancollateralActive",
    scriptName: `./js/loancollateral.js?q=${Math.random()}`,
  },
  disbursement: {
    template: "disbursement",
    startingFunction: "disbursementActive",
    scriptName: `./js/disbursement.js?q=${Math.random()}`,
  },
  payment: {
    template: "payment",
    startingFunction: "paymentActive",
    scriptName: `./js/payment.js?q=${Math.random()}`,
  },
  managesupplier: {
    template: "managesupplier",
    startingFunction: "managesupplierActive",
    scriptName: `./js/managesupplier.js?q=${Math.random()}`,
  },
  purchaseorder: {
    template: "purchaseorder",
    startingFunction: "purchaseorderActive",
    scriptName: `./js/purchaseorder.js?q=${Math.random()}`,
  },
  receivepurchases: {
    template: "receivepurchases",
    startingFunction: "receivepurchasesActive",
    scriptName: `./js/receivepurchases.js?q=${Math.random()}`,
  },
  allocateexpenditure: {
    template: "allocateexpenditure",
    startingFunction: "allocateexpenditureActive",
    scriptName: `./js/allocateexpenditure.js?q=${Math.random()}`,
  },
  serviceorder: {
    template: "serviceorder",
    startingFunction: "serviceorderActive",
    scriptName: `./js/serviceorder.js?q=${Math.random()}`,
  },
  receiveservice: {
    template: "receiveservice",
    startingFunction: "receiveserviceActive",
    scriptName: `./js/receiveservice.js?q=${Math.random()}`},
  rejectedservice: {
    template: "rejectedservice",
    startingFunction: "rejectedserviceActive",
    scriptName: `./js/rejectedservice.js?q=${Math.random()}`},
  payables: {
    template: "payables",
    startingFunction: "payablesActive",
    scriptName: `./js/payables.js?q=${Math.random()}`,
  },
  allpayables: {
    template: "allpayables",
    startingFunction: "allpayablesActive",
    scriptName: `./js/allpayables.js?q=${Math.random()}`,
  },
  supplierpayout: {
    template: "supplierpayout",
    startingFunction: "supplierpayoutActive",
    scriptName: `./js/supplierpayout.js?q=${Math.random()}`,
  },
  reversals: {
    template: "reversals",
    startingFunction: "reversalsActive",
    scriptName: `./js/reversals.js?q=${Math.random()}`,
  },
  viewreversals: {
    template: "viewreversals",
    startingFunction: "viewreversalsActive",
    scriptName: `./js/viewreversals.js?q=${Math.random()}`,
  },
  viewdeletedtransaction: {
    template: "viewdeletedtransaction",
    startingFunction: "viewdeletedtransactionActive",
    scriptName: `./js/viewdeletedtransaction.js?q=${Math.random()}`,
  },
  statementofaccount: {
    template: "statementofaccount",
    startingFunction: "statementofaccountActive",
    scriptName: `./js/statementofaccount.js?q=${Math.random()}`,
  },
  collection: {
    template: "collection",
    startingFunction: "collectionActive",
    scriptName: `./js/collection.js?q=${Math.random()}`,
  },
  collectionview: {
    template: "collectionview",
    startingFunction: "collectionviewActive",
    scriptName: `./js/collectionview.js?q=${Math.random()}`,
  },
  buildpropertyitems: {
    template: "buildpropertyitems",
    startingFunction: "buildpropertyitemsActive",
    scriptName: `./js/buildpropertyitems.js?q=${Math.random()}`,
  },
  categoryvaluetimeline: {
    template: "categoryvaluetimeline",
    startingFunction: "categoryvaluetimelineActive",
    scriptName: `./js/categoryvaluetimeline.js?q=${Math.random()}`,
  },
  propertyaccount: {
    template: "propertyaccount",
    startingFunction: "propertyaccountActive",
    scriptName: `./js/propertyaccount.js?q=${Math.random()}`,
  },
  propertyproduct: {
    template: "propertyproduct",
    startingFunction: "propertyproductActive",
    scriptName: `./js/propertyproduct.js?q=${Math.random()}`,
  },
  viewcompositeitems: {
    template: "viewcompositeitems",
    startingFunction: "viewcompositeitemsActive",
    scriptName: `./js/viewcompositeitems.js?q=${Math.random()}`,
  },
  viewpropertyaccount: {
    template: "viewpropertyaccount",
    startingFunction: "viewpropertyaccountActive",
    scriptName: `./js/viewpropertyaccount.js?q=${Math.random()}`,
  },
  maturedpropertyaccounts: {
    template: "maturedpropertyaccounts",
    startingFunction: "maturedpropertyaccountsActive",
    scriptName: `./js/maturedpropertyaccounts.js?q=${Math.random()}`,
  },
  propertytransactionreport: {
    template: "propertytransactionreport",
    startingFunction: "propertytransactionreportActive",
    scriptName: `./js/propertytransactionreport.js?q=${Math.random()}`,
  },
  missedpropertymaturity: {
    template: "missedpropertymaturity",
    startingFunction: "missedpropertymaturityActive",
    scriptName: `./js/missedpropertymaturity.js?q=${Math.random()}`,},
  deposit: {
    template: "deposit",
    startingFunction: "depositActive",
    scriptName: `./js/deposit.js?q=${Math.random()}`,
  },
  managepin: {
    template: "managepin",
    startingFunction: "managepinActive",
    scriptName: `./js/managepin.js?q=${Math.random()}`,
  },
  withdrawal: {
    template: "withdrawal",
    startingFunction: "withdrawalActive",
    scriptName: `./js/withdrawal.js?q=${Math.random()}`,
  },
  cashdeposit: {
    template: "cashdeposit",
    startingFunction: "cashdepositActive",
    scriptName: `./js/cashdeposit.js?q=${Math.random()}`,
  },
  makesales: {
    template: "makesales",
    startingFunction: "makesalesActive",
    scriptName: `./js/makesales.js?q=${Math.random()}`,
  },
  viewmakesales: {
    template: "viewmakesales",
    startingFunction: "viewmakesalesActive",
    scriptName: `./js/viewmakesales.js?q=${Math.random()}`,
  },
  salesanalytics: {
    template: "salesanalytics",
    startingFunction: "salesanalyticsActive",
    scriptName: `./js/salesanalytics.js?q=${Math.random()}`,
  },
  rotaryproduct: {
    template: "rotaryproduct",
    startingFunction: "rotaryproductActive",
    scriptName: `./js/rotaryproduct.js?q=${Math.random()}`,
  },
  rotarysavings: {
    template: "rotarysavings",
    startingFunction: "rotarysavingsActive",
    scriptName: `./js/rotarysavings.js?q=${Math.random()}`,
  },
  addlevel: {
    template: "addlevel",
    startingFunction: "addlevelActive",
    scriptName: `./js/addlevel.js?q=${Math.random()}`,
  },
  guarantor: {
    template: "guarantor",
    startingFunction: "guarantorActive",
    scriptName: `./js/guarantor.js?q=${Math.random()}`,
  },
  employmentrecord: {
    template: "employmentrecord",
    startingFunction: "employmentrecordActive",
    scriptName: `./js/employmentrecord.js?q=${Math.random()}`,
  },
  referee: {
    template: "referee",
    startingFunction: "refereeActive",
    scriptName: `./js/referee.js?q=${Math.random()}`,
  },
  qualification: {
    template: "qualification",
    startingFunction: "qualificationActive",
    scriptName: `./js/qualification.js?q=${Math.random()}`,
  },
  parentguardians: {
    template: "parentguardians",
    startingFunction: "parentguardiansActive",
    scriptName: `./js/parentguardians.js?q=${Math.random()}`,
  },
  query: {
    template: "query",
    startingFunction: "queryActive",
    scriptName: `./js/query.js?q=${Math.random()}`,
  },
  promotiondemotion: {
    template: "promotiondemotion",
    startingFunction: "promotiondemotionActive",
    scriptName: `./js/promotiondemotion.js?q=${Math.random()}`,
  },
  terminationresignation: {
    template: "terminationresignation",
    startingFunction: "terminationresignationActive",
    scriptName: `./js/terminationresignation.js?q=${Math.random()}`,
  },
  banklist: {
    template: "banklist",
    startingFunction: "banklistActive",
    scriptName: `./js/banklist.js?q=${Math.random()}`,
  },
  reciepients: {
    template: "reciepients",
    startingFunction: "reciepientsActive",
    scriptName: `./js/reciepients.js?q=${Math.random()}`,
  },
};

const ext = ".html";

function routerEvent(route) {
  if (route) {
    let queryParams = `?r=${route}`;
    window.history.pushState(
      queryParams,
      undefined,
      `${window.origin.concat(window.location.pathname, queryParams)}`
    );
    resolveUrlPage();
    if (!isDeviceMobile()) toggleNavigation();
  }
}

function resolveUrlPage() {
  let searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("r")) {
    let page = routerTree[searchParams.get("r").trim()].template;
    openRoute(page + ext);
  } else {
    // open home default page
    let queryParams = `?r=profile`;
    window.history.pushState(
      queryParams,
      undefined,
      `${window.origin.concat(window.location.pathname, queryParams)}`
    );
    openRoute("profile" + ext);
  }
  showActiveRoute();
}

function showActiveRoute() {
  let searchParams = new URLSearchParams(window.location.search);
  let page = searchParams.get("r");
  let menu = document.getElementById(page);
  document
    .querySelectorAll("#navigation .active")
    .forEach((item) => item.classList.remove("active"));
  document
    .querySelectorAll("#navigation .navitem-child-active")
    .forEach((item) => item.classList.remove("navitem-child-active"));
  if (menu?.classList.contains("navitem-child")) {
    menu.classList.add("navitem-child-active");
    menu.parentElement.previousElementSibling.classList.add("active");
  } else menu?.classList.add("active");
}

async function openRoute(url) {
  try {
    document.getElementById("workspace").innerHTML = `
            <div class="mt-20 flex h-full w-full">
                <div class="loader m-auto"></div>
            </div>
        `;
    document.getElementById("workspace").innerHTML = await httpRequest(url);
    // Get the search parameters from the URL
    let searchParams = new URLSearchParams(window.location.search);
    let page = searchParams.get("r");

    // Ensure `page` is not null and the element exists
    if (page) {
      let pageElement = document.getElementById(page);
      if (pageElement) {
        // Create a new div element for the alert
        let el = document.createElement("div");
        el.classList.add(
          "p-4",
          "mb-4",
          "text-sm",
          "text-blue-800",
          "rounded-lg",
          "bg-blue-50"
        );
        el.setAttribute("role", "alert");

        // Get the title attribute of the page element, if it exists
        let title = pageElement.getAttribute("title");
        // if (title) {
        //   el.innerHTML = `<div class="flex flex-col gap-2 lg:flex-row">
        //                                             <p class="font-medium">Note!<br/></p> 
        //                                             ${title}  
        //                                             <button onclick="document.getElementById('${page}').click()" type="button" class="btn ml-4 scale-[0.7] !bg-red-400 text-white">
        //                                                 <div class="btnloader" style="display: none;"></div>
        //                                                 <span>Reset</span> 
        //                                             </button>
        //                                     </div>`;
        // } else {
        //   el.innerHTML = `<div class="flex flex-col gap-2 lg:flex-row"><p class="font-medium">Note!<br/></p> Title attribute is missing. <button onclick="document.getElementById('${page}').click()" type="button" class="btn ml-4 scale-[0.7] !bg-red-400 text-white">
        //                 <div class="btnloader" style="display: none;"></div>
        //                 <span>Reset</span> 
        //             </button></div>`;
        // }
        if (title) {
          el.innerHTML = `<div class="flex flex-col gap-2 lg:flex-row">
                                                    <p class="font-medium">Note!<br/></p> 
                                                    ${title}  
                                                    <button onclick="document.getElementById('${page}').click()" type="button" class="btn ml-4 scale-[0.7] !bg-red-400 text-white">
                                                        <div class="btnloader" style="display: none;"></div>
                                                        <span>Reset</span> 
                                                    </button>
                                            </div>`;
        } else {
          el.innerHTML = `<div class="flex flex-col gap-2 lg:flex-row"><p class="font-medium">Note!<br/></p> Title attribute is missing. <button onclick="document.getElementById('${page}').click()" type="button" class="btn ml-4 scale-[0.7] !bg-red-400 text-white">
                        <div class="btnloader" style="display: none;"></div>
                        <span>Reset</span> 
                    </button></div>`;
        }

        // Prepend the alert element to the workspace
        document.getElementById("workspace").prepend(el);
      } else {
        console.error(`Element with ID '${page}' not found.`);
      }
    } else {
      console.error('Parameter "r" is missing from the URL.');
    }
    intializePageJavascript();
  } catch (error) {
    console.log(error);
  }
}

let timer;

function intializePageJavascript() {
  let searchParams = new URLSearchParams(window.location.search);
  let startingFunction =
    routerTree[searchParams.get("r").trim()].startingFunction;
  try {
    clearInterval(timer);
    timer = null;
    timer = setTimeout(() => window?.[startingFunction]?.(), 1000);
  } catch (e) {}
}

Object.freeze(routerTree);
