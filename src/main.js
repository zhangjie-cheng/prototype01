const app = document.querySelector('#app');
let selectedFiles = new Set([0, 1]);
let switches = new Map();
let currentAgent = 0;
let directoryDept = '全部成员';
let editingMemberIndex = null;
let editingRoleIndex = null;
let currentAccount = 'enterprise';
let marketCategory = 'all';
let helpCurrentCategory = 'beginner';
let helpCurrentArticle = 0;
let runningTaskDockPosition = null;
let runningDockDrag = null;
let suppressRunningDockClick = false;
let runningTaskCarouselIndex = 0;
let runningTaskCarouselTimer = null;
const showRunningTaskDock = false; // 暂时隐藏；需要恢复时改为 true。
let pendingMarketAgentIndex = null;
let pendingMarketAgentPrice = null;
let pendingCustomerServicePlanIndex = 2;
let agentTaskWizard = null;
let customerServiceThread = 0;
let customerServiceMode = 'history';
let customerServiceMessageType = 'all';
let customerServiceBoundAccount = 0;
let pendingCustomerServiceDeleteIndex = null;
let pendingCustomerServiceProvince = '';
let editingCustomerServiceKnowledgeIndex = null;
const selectedRecentIndexes = { enterprise:null, personal:null };
const accountBalances = { enterprise: 120, personal: 120 };
const hiredMarketAgents = { enterprise: new Set([0, 1, 2, 3, 4, 5, 6, 11, 12]), personal: new Set([1, 2, 4]) };
const agentAccessibleRoles = {
  enterprise: {
    0:['企业管理员','普通成员'],
    1:['企业管理员','普通成员','部门管理员'],
    2:['企业管理员','普通成员'],
    3:['企业管理员'],
    4:['企业管理员','普通成员','部门管理员'],
    5:['企业管理员','部门管理员'],
    6:['企业管理员','部门管理员'],
    11:['企业管理员','普通成员'],
    12:['企业管理员','普通成员','部门管理员']
  },
  personal: { 1:['本人'], 2:['本人'], 4:['本人'] }
};
const agentHireTimes = {
  enterprise: {
    0:'2026年7月15日',
    1:'2026年7月22日',
    2:'2026年7月29日',
    3:'2026年8月3日',
    4:'2026年8月12日',
    5:'2026年8月20日',
    6:'2026年8月26日',
    11:'2026年9月2日',
    12:'2026年9月9日'
  },
  personal: { 1:'2026年8月18日', 2:'2026年8月25日', 4:'2026年9月1日' }
};
const agentExecutionCounts = {
  enterprise: { 0:128, 1:96, 2:84, 3:76, 4:65, 5:51, 6:43, 11:32 },
  personal: { 1:25, 2:18, 4:11 }
};
const customerServicePlans = [
  { accounts:1, price:100, description:'适合体验 / 单号测试' },
  { accounts:3, price:300, description:'适合小规模测试验证' },
  { accounts:10, price:1000, description:'90% 私域团队的选择', recommended:true },
  { accounts:20, price:1700, description:'适合团队协作与规模运营' },
  { accounts:50, price:4000, description:'企业级私域运营' }
];
const agentSubscriptionPlans = {
  enterprise: {
    12:{ accounts:3, price:300, description:'适合小规模测试验证' }
  },
  personal:{}
};

const routes = {
  '/login': { title: '登录注册', standalone: true, render: loginPage },
  '/agreement': { title: '用户协议', standalone: true, render: () => articlePage('用户协议', agreementContent) },
  '/privacy': { title: '隐私政策', standalone: true, render: () => articlePage('隐私政策', privacyContent) },
  '/home': { title: '智能体人才市场', render: agentMarketPage },
  '/security': { title: '安全说明', render: securityPage },
  '/balance': { title: '账户余额', render: balancePage },
  '/chat': { title: '新对话', render: chatPage, full: true },
  '/chat-result': { title: '对话结果页', render: chatResultPage },
  '/task-detail': { title: '任务详情', render: techTaskDetailPage },
  '/task-detail-backup': { title: '任务详情·浅色备份', render: taskDetailPage },
  '/customer-service': { title: 'AI智能客服', render: customerServicePage, full: true },
  '/static-kb': { title: '静态知识库', render: staticKnowledgePage },
  '/static-files': { title: '静态知识库文件列表', render: () => fileListPage('static') },
  '/dynamic-kb': { title: '动态知识库', render: dynamicKnowledgePage },
  '/dynamic-files': { title: '动态知识库文件列表', render: () => fileListPage('dynamic') },
  '/team': { title: '智能体团队', render: agentTeamPage },
  '/market': { title: '智能体人才市场', render: agentMarketPage },
  '/directory': { title: '企业通讯录', render: directoryPage },
  '/roles': { title: '角色管理', render: roleManagementPage },
  '/help': { title: '帮助中心', render: helpCenterPage },
  '/feedback': { title: '意见反馈', render: feedbackPage }
};

const primaryNavItems = [
  ['/chat', 'chat', '新对话'],
  ['/team', 'users', '智能体团队'],
  ['/market', 'grid', '智能体人才市场'],
  ['/customer-service', 'headset', 'AI智能客服'],
  ['/static-kb', 'book', '知识库']
];

const recentItems = {
  enterprise: [
    { type:'conversation', title:'望湘园本周门店活动怎么安排', time:'刚刚' },
    { type:'task', title:'生成本周门店运营周报', time:'10分钟前', agentIndex:0, status:'执行中', progress:68, scope:'全部门店', source:'企业知识库资料', deliverable:'详细分析报告', detailStyle:'light' },
    { type:'conversation', title:'新客立减活动设置', time:'25分钟前' },
    { type:'task', title:'制定国庆营销增长方案', time:'1小时前', agentIndex:3, status:'已完成', progress:100, scope:'多个门店', source:'企业知识库资料', deliverable:'执行清单', detailStyle:'tech' },
    { type:'conversation', title:'产品资料问答', time:'昨天' },
    { type:'task', title:'分析连锁门店经营问题', time:'昨天', agentIndex:6, status:'执行中', progress:12, scope:'全部门店', source:'本次任务说明', deliverable:'表格或数据摘要', detailStyle:'tech' },
    { type:'task', title:'生成华东区域门店培训计划', time:'昨天', agentIndex:0, status:'执行中', progress:52, scope:'华东区域门店', source:'企业知识库资料', deliverable:'培训计划', detailStyle:'light' },
    { type:'task', title:'整理八月经营数据分析', time:'昨天', agentIndex:1, status:'执行中', progress:39, scope:'全部门店', source:'经营数据文件', deliverable:'数据分析报告', detailStyle:'tech' },
    { type:'task', title:'生成国庆活动宣传内容', time:'昨天', agentIndex:2, status:'执行中', progress:26, scope:'品牌活动', source:'企业知识库资料', deliverable:'宣传内容包', detailStyle:'tech', interrupted:true, errorStep:'资料接入异常' }
  ],
  personal: [
    { type:'conversation', title:'今天的学习计划', time:'刚刚' },
    { type:'task', title:'整理本周数据分析计划', time:'20分钟前', agentIndex:1, status:'执行中', progress:45, scope:'一个项目', source:'本次任务说明', deliverable:'执行清单', detailStyle:'light' },
    { type:'conversation', title:'整理会议纪要', time:'2小时前' },
    { type:'task', title:'生成个人工作数据摘要', time:'昨天', agentIndex:1, status:'已完成', progress:100, scope:'当前事项', source:'暂不指定资料', deliverable:'表格或数据摘要', detailStyle:'tech' }
  ]
};

const customerServiceThreads = [
  {name:'王丹丹',avatar:'./assets/agent-avatar-03.jpg',channel:'微信客户',tag:'重点客户',unread:2,last:'营销方案已经收到，谢谢',messages:[
    {from:'customer',type:'file',time:'10:24',name:'望湘园门店活动需求.xlsx',size:'1.5 MB'},
    {from:'customer',type:'text',time:'10:25',content:'这是我们本周的营销需求，请帮忙看一下。'},
    {from:'agent',type:'text',time:'10:25',content:'好的，已经收到。我会结合门店客群和近期活动数据，为您整理一份可执行的营销方案。'},
    {from:'customer',type:'voice',time:'10:27',duration:'40″'},
    {from:'agent',type:'text',time:'10:28',content:'语音内容已识别，我会重点补充会员复购和午市引流建议。'}
  ]},
  {name:'汪老师',avatar:'./assets/agent-avatar-02.jpg',channel:'企微客户',tag:'待跟进',unread:0,last:'门店培训资料什么时候可以发？',messages:[
    {from:'customer',type:'text',time:'09:42',content:'门店培训资料什么时候可以发？'},
    {from:'agent',type:'text',time:'09:43',content:'正在为您核对最新版资料，预计今天下午可以整理完成并发送。'}
  ]},
  {name:'企业邮箱小宁',avatar:'./assets/agent-avatar-06.jpg',channel:'网页咨询',tag:'新客户',unread:1,last:'想了解企业知识库的收费方式',messages:[
    {from:'customer',type:'text',time:'昨天 18:20',content:'想了解企业知识库的收费方式，以及可以上传哪些文件。'},
    {from:'agent',type:'text',time:'昨天 18:21',content:'企业知识库支持常见办公文档与 PDF 文件，费用会根据存储空间和调用量计算。'}
  ]},
  {name:'Carry',avatar:'./assets/agent-avatar-04.jpg',channel:'微信客户',tag:'已解决',unread:0,last:'好的，谢谢你的帮助',messages:[
    {from:'customer',type:'text',time:'周一 16:08',content:'活动数据可以导出成表格吗？'},
    {from:'agent',type:'text',time:'周一 16:09',content:'可以，进入任务详情页后，在交付结果区域下载数据摘要即可。'},
    {from:'customer',type:'text',time:'周一 16:10',content:'好的，谢谢你的帮助。'}
  ]},
  {name:'赵女士',avatar:'./assets/agent-avatar-09.jpg',channel:'小程序客户',tag:'咨询中',unread:3,last:'能帮我查询最近的消费记录吗？',messages:[
    {from:'customer',type:'text',time:'周一 11:32',content:'能帮我查询最近的消费记录吗？'},
    {from:'agent',type:'text',time:'周一 11:33',content:'可以，请进入账户信息页面查看消费明细。需要我为您说明具体路径吗？'}
  ]},
  {name:'李先生',avatar:'./assets/agent-avatar-10.jpg',channel:'网页咨询',tag:'已解决',unread:0,last:'已经处理好了',messages:[
    {from:'customer',type:'text',time:'上周五',content:'登录验证码一直收不到。'},
    {from:'agent',type:'text',time:'上周五',content:'建议先确认手机号和短信拦截设置，稍后重新获取验证码。'},
    {from:'customer',type:'text',time:'上周五',content:'已经处理好了。'}
  ]}
];

const customerServiceAccounts = [
  {name:'望湘园客服－小王',platform:'个人微信 · 上海',mark:'王',color:'#347ee2',soft:'#e9f3ff',working:true,today:12,threadIndexes:[0,1,3],knowledgeBases:['产品资料','客户FAQ','报价规则']},
  {name:'望湘园客服－小周',platform:'个人微信 · 上海',mark:'周',color:'#1da673',soft:'#e7f8f0',working:true,today:8,threadIndexes:[0,2,3],knowledgeBases:['客户案例','培训资料','市场品牌情报']},
  {name:'门店客服－小林',platform:'个人微信 · 浙江',mark:'林',color:'#7658d4',soft:'#f0ecff',working:true,today:5,threadIndexes:[4,0],knowledgeBases:['产品资料','企业制度','商业经营情报']},
  {name:'售后客服－小陈',platform:'个人微信 · 江苏',mark:'陈',color:'#e47a4f',soft:'#fff0e9',working:false,today:0,threadIndexes:[2,5],knowledgeBases:['客户FAQ','老员工经验']}
];

const marketClusters = {
  operations: { name:'运营集群', color:'#367ee8', soft:'#eaf3ff' },
  data: { name:'数据集群', color:'#168f8b', soft:'#e6f7f5' },
  content: { name:'内容集群', color:'#7b5bd1', soft:'#f1edff' },
  marketing: { name:'营销集群', color:'#df704b', soft:'#fff0e9' },
  service: { name:'服务集群', color:'#318cc7', soft:'#e9f6fd' },
  management: { name:'管理集群', color:'#5c6fc5', soft:'#ecefff' }
};

const agentTaskCapabilities = {
  operations: ['制定门店运营方案','分析经营问题并给出建议','生成连锁经营执行计划','设计门店活动方案'],
  data: ['分析业务数据与指标','生成经营分析报告','诊断数据异常原因','制作管理层数据摘要'],
  content: ['策划内容选题','撰写品牌营销文案','生成短视频脚本','制定内容发布计划'],
  marketing: ['制定营销增长方案','设计客户转化活动','规划私域运营策略','分析活动转化效果'],
  service: ['整理客户常见问题','生成标准服务话术','优化客户回复内容','制定客户服务规范'],
  management: ['拆解项目目标与计划','整理任务与责任分工','制定招聘面试方案','识别项目风险事项']
};

const marketAgents = [
  { avatar:'./assets/agent-avatar-01.jpg', color:'#4f8ff0', soft:'#eaf3ff', group:'operations', name:'门店运营专家', intro:'围绕门店日常经营，提供活动策划、客流分析和运营优化建议。', tags:['门店运营','活动策划','经营分析'] },
  { avatar:'./assets/agent-avatar-02.jpg', color:'#16a3a0', soft:'#e4f8f6', group:'data', name:'数据分析师', intro:'擅长业务数据分析与指标诊断，快速生成清晰的数据洞察报告。', tags:['数据分析','经营指标','分析报告'] },
  { avatar:'./assets/agent-avatar-03.jpg', color:'#8b67dc', soft:'#f0eaff', group:'content', name:'内容创作专家', intro:'根据品牌调性生成公众号、社交媒体和营销活动所需内容。', tags:['内容创作','品牌文案','营销素材'] },
  { avatar:'./assets/agent-avatar-04.jpg', color:'#ed7b56', soft:'#fff0e9', group:'marketing', name:'营销增长顾问', intro:'诊断获客链路并制定增长计划，帮助提升活动转化与客户复购。', tags:['增长策略','用户运营','转化提升'] },
  { avatar:'./assets/agent-avatar-05.jpg', color:'#3b9ed8', soft:'#e9f6fd', group:'service', name:'客户服务助手', intro:'整理高频客户问题，输出准确、统一并有温度的服务回复。', tags:['客户服务','智能问答','服务规范'] },
  { avatar:'./assets/agent-avatar-06.jpg', color:'#5f73d8', soft:'#ebeeff', group:'data', name:'行业深度洞察专家', intro:'追踪行业动态与竞争信息，提炼趋势、机会及潜在经营风险。', tags:['行业研究','竞品洞察','趋势分析'] },
  { avatar:'./assets/agent-avatar-07.jpg', color:'#d85d86', soft:'#ffedf3', group:'operations', name:'连锁经营专家集群', intro:'由选址、运营、营销和供应链智能体组成，协同完成连锁经营任务。', tags:['多智能体','连锁经营','协同执行'], cluster:true },
  { avatar:'./assets/agent-avatar-08.jpg', color:'#e5a23b', soft:'#fff5df', group:'content', name:'短视频内容集群', intro:'从选题、脚本到发布计划，多角色协作完成短视频内容生产。', tags:['短视频','脚本创作','内容矩阵'], cluster:true },
  { avatar:'./assets/agent-avatar-09.jpg', color:'#34a36f', soft:'#e7f8ef', group:'data', name:'财务分析专家', intro:'辅助整理经营收支、成本构成和预算执行情况，生成财务摘要。', tags:['财务分析','成本管理','预算规划'] },
  { avatar:'./assets/agent-avatar-10.jpg', color:'#d07055', soft:'#fff0eb', group:'management', name:'招聘助手', intro:'提供职位描述、候选人筛选和面试题设计等招聘流程支持。', tags:['招聘管理','人才筛选','面试评估'] },
  { avatar:'./assets/agent-avatar-11.jpg', color:'#6a8c4c', soft:'#eef7e7', group:'marketing', name:'私域运营专家集群', intro:'协同完成用户分层、社群内容、活动触达和复购策略设计。', tags:['私域运营','社群增长','用户分层'], cluster:true },
  { avatar:'./assets/agent-avatar-12.jpg', color:'#387fc4', soft:'#e9f3fc', group:'management', name:'项目管理助手', intro:'拆解项目目标与里程碑，整理任务责任人、时间计划和风险事项。', tags:['项目管理','任务拆解','风险跟踪'] },
  { avatar:'./assets/agent-avatar-05.jpg', color:'#318cc7', soft:'#e9f6fd', group:'service', name:'AI客服智能体', intro:'接入个人微信并结合企业知识库，自动回复客户咨询，支持多账号统一服务。', tags:['个人微信','智能客服','知识库问答'], customerService:true }
];

function currentPath() {
  const path = location.hash.replace('#', '').split('?')[0] || '/login';
  return routes[path] ? path : '/login';
}

function navigate(path) { location.hash = path; }

function sidebarMarkup(nav) {
  const isPersonal = currentAccount === 'personal';
  const enterpriseAvatar = '<div class="store-avatar"><img src="./assets/wangxiangyuan.png" alt="望湘园"></div>';
  const personalAvatar = '<div class="store-avatar personal-avatar">周</div>';
  const currentAvatar = isPersonal ? personalAvatar : enterpriseAvatar;
  const currentName = isPersonal ? '周杰伦' : '望湘园 1367';
  const currentId = isPersonal ? '个人账号' : 'ID：249857397583';
  const accountTag = isPersonal ? '<em class="personal-tag">个人版</em>' : '';
  const planCard = `<div class="balance-mini"><div class="balance-mini-row"><span>余额:<strong>${accountBalances[currentAccount].toFixed(2)} 元</strong></span></div><a class="balance-detail" href="#/balance">查看详情</a></div>`;
  const enterpriseMenu = isPersonal ? '' : '<button class="popover-item" data-nav="/directory">'+icon('users',18)+'<span>企业通讯录</span>'+icon('chevron',15)+'</button><button class="popover-item" data-nav="/roles">'+icon('key',18)+'<span>角色管理</span>'+icon('chevron',15)+'</button>';
  const accountSwitcher = '<div class="account-switcher hidden" id="account-switcher"><div class="account-switcher-title">切换账号</div><button class="account-option '+(!isPersonal?'active':'')+'" data-account="enterprise">'+enterpriseAvatar+'<span><strong>望湘园 1367</strong><small>企业版 · 超级管理员</small></span>'+(!isPersonal?icon('check',16):'')+'</button><button class="account-option '+(isPersonal?'active':'')+'" data-account="personal">'+personalAvatar+'<span><strong>周杰伦 <em class="personal-tag">个人版</em></strong><small>个人账号</small></span>'+(isPersonal?icon('check',16):'')+'</button></div>';
  return logo()+nav+'<div class="sidebar-foot">'+planCard+'<div class="user-popover hidden" id="user-popover"><button class="popover-profile account-current" data-action="toggle-account-switcher">'+currentAvatar+'<div><strong>'+currentName+' '+accountTag+'</strong><small>'+currentId+'</small></div>'+icon('chevron',15)+'</button>'+accountSwitcher+'<div class="popover-line"></div>'+enterpriseMenu+'<button class="popover-item" data-nav="/help">'+icon('book',18)+'<span>帮助中心</span>'+icon('chevron',15)+'</button><button class="popover-item" data-nav="/feedback">'+icon('chat',18)+'<span>意见反馈</span>'+icon('chevron',15)+'</button><button class="popover-item" data-action="about">'+icon('info',18)+'<span>关于</span></button><button class="popover-item logout" data-action="logout-confirm">'+icon('logout',18)+'<span>退出登录</span></button></div><button class="store user-menu-trigger" data-action="toggle-user-menu">'+currentAvatar+'<span>'+currentName+' '+accountTag+'<small>'+(isPersonal?'个人账号':'超级管理员')+'</small></span><span class="user-chevron">⌃</span></button></div>';
}

function runningTaskStep(task) {
  if(task.interrupted)return task.errorStep||'执行异常';
  if(task.progress<15)return '目标解析';
  if(task.progress<40)return '数据接入';
  if(task.progress<75)return '智能执行';
  return '质量校验';
}

function runningTaskEntries(){return recentItems[currentAccount].map((task,index)=>({task,index})).filter(({task})=>task.type==='task'&&task.status==='执行中')}

function runningTaskTitle(agent,task){return `<span class="running-task-agent">${agent.name} 正在执行</span><b>「${task.title}」</b><span class="running-task-suffix">任务</span>`}

function runningTaskTriggerContent(entry,total){const agent=marketAgents[entry.task.agentIndex];const step=runningTaskStep(entry.task);return `<span class="running-task-avatar"><img src="${agent.avatar}" alt="${agent.name}"><i></i></span><span class="running-task-copy"><small class="running-task-step">${step}${entry.task.interrupted?'<b>执行中断</b>':''}</small><span class="running-task-title">${runningTaskTitle(agent,entry.task)}</span></span><em>${total}</em>${icon('chevron',15)}`}

function runningTaskDock() {
  const running=runningTaskEntries();
  if(!running.length)return '';
  const primary=running[runningTaskCarouselIndex%running.length];
  const dockStyle=runningTaskDockPosition?`style="left:${runningTaskDockPosition.left}px;top:${runningTaskDockPosition.top}px;right:auto;bottom:auto"`:'';
  const list=running.map(({task,index})=>{const agent=marketAgents[task.agentIndex];const step=runningTaskStep(task);return `<button class="running-task-item ${task.interrupted?'interrupted':''}" data-running-task-index="${index}"><span class="running-task-avatar"><img src="${agent.avatar}" alt="${agent.name}"><i></i></span><span class="running-task-copy"><small class="running-task-step">${step}${task.interrupted?'<b>执行中断</b>':''}</small><span class="running-task-title">${runningTaskTitle(agent,task)}</span><span class="running-task-progress"><i style="width:${task.progress}%"></i></span></span><em>${task.progress}%</em>${icon('chevron',14)}</button>`}).join('');
  return `<aside class="running-task-dock" id="running-task-dock" ${dockStyle}><div class="running-task-panel hidden" id="running-task-panel"><header data-running-task-drag><div><span><i></i>LIVE TASKS</span><strong>进行中的任务</strong></div><em>${running.length} 个</em><button class="icon-btn" data-action="toggle-running-tasks" aria-label="收起任务列表">${icon('close',17)}</button></header><div>${list}</div><footer>拖动标题栏可移动浮层 · 任务状态实时展示</footer></div><button class="running-task-trigger ${primary.task.interrupted?'interrupted':''}" data-action="toggle-running-tasks" data-running-task-drag>${runningTaskTriggerContent(primary,running.length)}</button></aside>`;
}

function startRunningTaskCarousel(){
  if(runningTaskCarouselTimer)clearInterval(runningTaskCarouselTimer);
  runningTaskCarouselTimer=null;
  const trigger=document.querySelector('.running-task-trigger');
  const running=runningTaskEntries();
  if(!trigger||running.length<2)return;
  runningTaskCarouselTimer=setInterval(()=>{
    const currentTrigger=document.querySelector('.running-task-trigger');
    const panel=document.querySelector('#running-task-panel');
    if(!currentTrigger){clearInterval(runningTaskCarouselTimer);runningTaskCarouselTimer=null;return}
    if(panel&&!panel.classList.contains('hidden'))return;
    runningTaskCarouselIndex=(runningTaskCarouselIndex+1)%running.length;
    const entry=running[runningTaskCarouselIndex];
    currentTrigger.classList.toggle('interrupted',Boolean(entry.task.interrupted));
    currentTrigger.innerHTML=runningTaskTriggerContent(entry,running.length);
    currentTrigger.classList.remove('task-switching');
    void currentTrigger.offsetWidth;
    currentTrigger.classList.add('task-switching');
  },3200)
}

function shell(content, route, path) {
  const routeTitle = currentAccount === 'personal' && path === '/balance' ? '账号信息' : route.title;
  const primaryNav = primaryNavItems.map(([href, ico, text]) => {
    const active = href && (path === href || (href==='/market'&&path==='/home') || (href.includes('-kb') && path.startsWith(href.replace('-kb',''))));
    return href
      ? `<a class="nav-link ${active?'active':''}" href="#${href}">${icon(ico)}<span>${text}</span></a>`
      : `<button type="button" class="nav-link">${icon(ico)}<span>${text}</span></button>`;
  }).join('');
  const recentNav = recentItems[currentAccount].map((item,index) => `<button type="button" class="nav-link recent-item recent-${item.type} ${selectedRecentIndexes[currentAccount]===index?'current':''}" data-recent-index="${index}" title="${item.title}"><span class="recent-icon">${item.type==='conversation'?icon('chat',15):`<img src="${marketAgents[item.agentIndex].avatar}" alt="">`}</span><span class="recent-copy"><strong>${item.title}</strong></span></button>`).join('');
  const nav = `<div class="sidebar-navigation"><nav class="nav flat-nav">${primaryNav}</nav><div class="recent-title">最近</div><nav class="nav recent-list">${recentNav}</nav></div>`;
  const header = path === '/chat'
    ? '<header class="new-chat-header"><span>新对话</span><strong>开始一段新对话</strong></header>'
    : `<header class="topbar"><button class="icon-btn mobile-menu" data-action="menu">${icon('menu')}</button><div class="crumb">幻馨 AI / <strong>${routeTitle}</strong></div><div class="top-actions"><button class="icon-btn" data-toast="暂无新通知">${icon('bell')}</button><button class="icon-btn" data-toast="帮助中心正在建设中">${icon('book')}</button><div class="top-user"><div class="avatar">周</div><span>周杰伦</span></div></div></header>`;
  return `<div class="app-shell">
    <aside class="sidebar" id="sidebar">${sidebarMarkup(nav)}</aside>
    <main class="workspace">${header}${route.full ? content : `<section class="page">${content}</section>`}</main>
    ${showRunningTaskDock?runningTaskDock():''}
  </div>`;
}

function render() {
  const path = currentPath(); const route = routes[path];
  app.innerHTML = route.standalone ? route.render() : shell(route.render(), route, path);
  window.scrollTo(0, 0);
  startRunningTaskCarousel();
}

function pageHead(title, subtitle, actions = '') {
  return `<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="page-head-actions">${actions}</div></div>`;
}

function homePage() {
  const isPersonal = currentAccount === 'personal';
  return `${pageHead(isPersonal ? '你好，周杰伦' : '下午好，周杰伦', isPersonal ? '欢迎回到幻馨 AI 个人工作台' : '欢迎回到幻馨智能体商家工作台', `<button class="btn primary" data-action="start-chat">${icon('chat',17)} 开始对话</button>`)}
    <div class="balance-grid"><div class="panel balance-card"><span class="balance-label">${isPersonal?'个人版可用积分':'账户余额'}</span><p class="balance-amount">${isPersonal?'20':'¥ 120.00'}</p><button class="btn primary" data-action="${isPersonal?'start-chat':'recharge'}">${isPersonal?'开始对话':'立即充值'}</button></div><div class="panel chart-card"><div class="chart-title">近 7 天 AI 消耗</div>${bars()}</div></div>
    <div class="notice">${icon('shield',17)} <strong>平台福利月：</strong>知识库智能体免费体验，不收取 token 费用。赶快上传资料来体验吧。</div>
    <div class="page-head"><div><h1 style="font-size:20px">我的知识库</h1><p>将企业资料沉淀为 AI 可调用的长期记忆</p></div><div class="page-head-actions"><a href="#/static-kb" class="btn">查看全部 ${icon('arrow',16)}</a></div></div>
    <div class="library-grid">${staticLibraries.slice(0,3).map(staticCard).join('')}</div>`;
}

const helpCatalog = {
  beginner:{icon:'user',title:'新手入门',description:'快速了解登录、账号切换与基础操作',total:6,articles:[
    ['如何登录并进入幻馨 AI 工作台？','使用手机号和短信验证码登录，首次使用也可以快速注册企业账号。',['打开登录注册页并选择“手机号登录”','填写手机号并获取短信验证码','勾选用户协议与隐私政策后点击登录']],
    ['个人版与企业版账号如何切换？','拥有两种账号身份时，可以从左侧底部快速切换当前工作空间。',['点击左侧底部的当前账号名称','在账号列表中选择个人版或企业版','确认左侧菜单与最近记录已切换']],
    ['如何开始一段新对话？','从新对话页面选择智能体并输入你的业务问题。',['点击左侧菜单“新对话”','选择需要调用的智能体','输入问题并发送']],
    ['如何查看最近的对话和任务？','左侧“最近”列表会同时展示对话记录和智能体任务。',['在左侧找到“最近”列表','通过图标区分对话与任务','点击标题进入对应详情页面']]
  ]},
  agents:{icon:'users',title:'智能体使用',description:'了解雇佣智能体、创建任务与查看结果',total:12,articles:[
    ['如何从人才市场雇佣智能体？','浏览智能体能力与订阅价格，并使用账户余额完成雇佣。',['进入“智能体人才市场”','点击智能体卡片查看技能与调用方法','点击“雇佣”并确认余额支付']],
    ['如何为智能体创建一个任务？','通过多轮选项交互，让智能体收集执行任务所需的信息。',['在智能体团队点击“建任务”','选择智能体可以帮你完成的事项','根据提示完成几轮信息选择']],
    ['在哪里查看任务执行进度？','任务详情页会展示执行阶段、实时动态与交付物状态。',['从左侧“最近”列表找到任务','点击带有智能体头像的任务标题','查看进度、活动流和交付文件']],
    ['智能体团队与人才市场有什么区别？','团队展示已雇佣智能体，人才市场用于发现和订阅新智能体。',['人才市场负责浏览与雇佣','智能体团队负责发起日常任务','两个页面会同步展示雇佣状态']]
  ]},
  knowledge:{icon:'book',title:'知识库',description:'学习创建知识库、上传资料与内容维护',total:8,articles:[
    ['如何创建企业知识库？','创建一个新的资料空间，让智能体可以调用企业内容。',['进入左侧“知识库”','点击新建知识库','填写名称与说明后确认创建']],
    ['知识库支持哪些文件格式？','原型支持展示 PDF、Word、PPT 和 Excel 等常用办公格式。',['打开目标知识库','点击上传文件','选择文件并加入上传队列']],
    ['如何启用或停用知识库文件？','通过文件列表中的状态开关控制资料是否参与智能体检索。',['进入知识库文件列表','找到需要调整的文件','点击状态开关完成切换']],
    ['智能体如何使用知识库资料？','创建任务时选择企业知识库，智能体会读取相关资料作为上下文。',['创建智能体任务','在参考资料中选择企业知识库','确认任务并查看资料处理状态']]
  ]},
  billing:{icon:'wallet',title:'费用与订阅',description:'账户余额、订阅费用与扣费规则说明',total:5,articles:[
    ['如何查看账户余额和消费记录？','从左侧余额组件进入账户信息页面查看余额与记录。',['点击左侧余额卡片中的“查看详情”','切换消费记录或充值记录','查看金额、时间与业务说明']],
    ['智能体订阅费用如何支付？','当前原型展示使用账户余额支付首月订阅优惠费用。',['选择未雇佣的智能体','在订阅弹窗核对价格','选择余额支付并确认']],
    ['首月优惠和标准订阅费有什么区别？','首月按优惠价格展示，次月起恢复标准月度订阅价格。',['查看智能体卡片的两种价格','在详情弹窗核对订阅说明','确认后完成原型支付']],
    ['余额不足时该怎么办？','余额不足时系统会提示先进入账户页面充值。',['打开账户余额详情','选择充值金额','完成原型充值后重新订阅']]
  ]},
  enterprise:{icon:'building',title:'企业管理',description:'企业通讯录、组织架构与角色权限配置',total:9,articles:[
    ['如何添加企业成员？','填写成员必选信息并分配所属部门和企业角色。',['进入企业通讯录','点击“添加企业成员”','填写姓名、手机号、部门和角色']],
    ['如何创建和维护企业部门？','在组织架构弹窗中创建、编辑或删除部门。',['点击“管理组织架构”','选择上级部门并新建部门','使用右侧按钮编辑或删除']],
    ['如何新建企业角色？','配置角色名称、操作权限和数据访问范围。',['进入角色管理页面','点击“新建角色”','勾选功能模块并选择数据范围']],
    ['为什么有些部门不能删除？','有关联成员或下级部门的部门需要先解除关联。',['查看部门关联成员数量','移动成员并处理下级部门','再次点击删除按钮']]
  ]},
  security:{icon:'shield',title:'安全与隐私',description:'数据隔离、账号安全与隐私保护说明',total:4,articles:[
    ['个人版和企业版的数据如何隔离？','不同账号空间的对话、任务和菜单内容相互独立。',['确认当前账号标签','切换至另一个账号空间','检查最近记录与智能体团队']],
    ['如何保护账号登录安全？','请妥善保管验证码，并仅在可信设备上登录账号。',['不要向他人提供短信验证码','使用完成后及时退出公共设备','发现异常后联系企业管理员']],
    ['平台如何保护知识库资料？','通过权限控制、传输保护和访问隔离保障企业资料安全。',['按角色配置访问权限','定期检查知识库文件状态','及时停用不再使用的成员']],
    ['在哪里查看用户协议和隐私政策？','登录注册页面提供用户协议与隐私政策的独立入口。',['返回登录注册页','点击对应协议名称','阅读条款与生效日期']]
  ]}
};

function helpHashParams(){return new URLSearchParams(location.hash.includes('?')?location.hash.split('?')[1]:'')}

function helpCenterLandingLegacy() {
  const categories = [
    ['beginner','user','新手入门','快速了解登录、账号切换与基础操作','6 篇指南'],
    ['agents','users','智能体使用','了解雇佣智能体、创建任务与查看结果','12 篇指南'],
    ['knowledge','book','知识库','学习创建知识库、上传资料与内容维护','8 篇指南'],
    ['billing','wallet','费用与订阅','账户余额、订阅费用与扣费规则说明','5 篇指南'],
    ['enterprise','building','企业管理','企业通讯录、组织架构与角色权限配置','9 篇指南'],
    ['security','shield','安全与隐私','数据隔离、账号安全与隐私保护说明','4 篇指南']
  ];
  const categoryCards = categories.map(([key,ico,title,desc,count])=>`<button class="help-category-card" data-nav="/help-category?category=${key}"><span>${icon(ico,22)}</span><div><strong>${title}</strong><p>${desc}</p><small>${count} ${icon('chevron',13)}</small></div></button>`).join('');
  return `<section class="help-center">
    <div class="help-hero"><div class="help-hero-copy"><span>HUANXIN SUPPORT CENTER</span><h1>你好，需要什么帮助？</h1><p>查找产品使用指南与常见问题，快速了解幻馨 AI 工作台。</p><label class="help-search">${icon('search',19)}<input placeholder="搜索问题，例如：如何雇佣智能体"><button data-toast="正在搜索帮助内容">搜索</button></label><div class="help-hot"><span>热门搜索</span><button data-toast="正在查看账号切换说明">切换账号</button><button data-toast="正在查看智能体订阅说明">智能体订阅</button><button data-toast="正在查看知识库说明">上传资料</button></div></div><div class="help-hero-visual"><i></i><span>${icon('book',42)}</span><b>24/7</b><small>智能帮助服务</small></div></div>
    <div class="help-section-head"><div><h2>使用指南</h2><p>按功能分类查找你需要的帮助内容</p></div><span>共 44 篇内容</span></div>
    <div class="help-category-grid">${categoryCards}</div>
    <div class="help-lower-grid"><section class="help-faq panel"><div class="help-panel-head"><div><h2>常见问题</h2><p>大家最近经常查看的问题</p></div><button data-toast="正在加载更多问题">查看全部</button></div><details open><summary><span>01</span>个人版和企业版账号有什么区别？${icon('chevron',15)}</summary><p>两个版本的数据相互隔离。企业版支持企业知识库、通讯录和角色权限管理，个人版用于个人对话及任务。</p></details><details><summary><span>02</span>如何雇佣智能体并创建任务？${icon('chevron',15)}</summary><p>进入“智能体人才市场”，选择所需智能体并完成订阅。雇佣后可在智能体团队中点击“建任务”。</p></details><details><summary><span>03</span>知识库支持上传哪些文件？${icon('chevron',15)}</summary><p>原型中展示支持 PDF、Word、PPT 和 Excel 等常用办公文件格式。</p></details><details><summary><span>04</span>在哪里查看任务执行进度？${icon('chevron',15)}</summary><p>在左侧“最近”列表中点击任务标题，即可进入任务详情页面查看执行流程与交付物。</p></details></section><aside class="help-contact panel"><span class="help-contact-icon">${icon('chat',25)}</span><small>没有找到答案？</small><h2>联系在线客服</h2><p>工作日 09:00–18:00<br>我们会尽快为你解答</p><button class="btn primary" data-toast="在线客服连接中（原型演示）">${icon('chat',16)} 在线咨询</button><button class="btn" data-nav="/feedback">提交问题反馈</button><div><span>平均响应时间</span><strong>约 2 分钟</strong></div></aside></div>
  </section>`;
}

function helpCategoryPage() {
  const params=helpHashParams();
  const categoryKey=helpCatalog[params.get('category')]?params.get('category'):'beginner';
  const category=helpCatalog[categoryKey];
  const categoryNav=Object.entries(helpCatalog).map(([key,item])=>`<button class="help-side-category ${key===categoryKey?'active':''}" data-nav="/help-category?category=${key}"><span>${icon(item.icon,17)}</span><strong>${item.title}</strong><small>${item.total}</small>${icon('chevron',13)}</button>`).join('');
  const articles=category.articles.map((article,index)=>`<a class="help-question-row" href="#/help-article?category=${categoryKey}&article=${index}"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${article[0]}</strong><p>${article[1]}</p><small>使用指南 · 约 ${index+2} 分钟阅读</small></div>${index===0?'<em>热门</em>':''}${icon('chevron',16)}</a>`).join('');
  return `<section class="help-subpage"><nav class="help-breadcrumb"><a href="#/help">帮助中心</a>${icon('chevron',13)}<span>${category.title}</span></nav><header class="help-category-hero"><span>${icon(category.icon,27)}</span><div><small>HELP CATEGORY</small><h1>${category.title}</h1><p>${category.description}</p></div><em>${category.total} 篇指南</em></header><div class="help-category-layout"><aside class="help-side-nav panel"><h3>问题分类</h3>${categoryNav}<a href="#/feedback">${icon('chat',16)}<span><strong>没有找到答案？</strong><small>向我们提交问题反馈</small></span>${icon('arrow',14)}</a></aside><main class="help-question-list panel"><div class="help-question-head"><div><h2>${category.title}问题</h2><p>选择问题查看详细说明与操作步骤</p></div><label>${icon('search',16)}<input placeholder="在此分类中搜索"></label></div>${articles}<div class="help-list-note">当前为演示原型，列表仅展示部分帮助内容。</div></main></div></section>`;
}

function helpArticlePage() {
  const params=helpHashParams();
  const categoryKey=helpCatalog[params.get('category')]?params.get('category'):'beginner';
  const category=helpCatalog[categoryKey];
  const articleIndex=Math.min(Math.max(Number(params.get('article'))||0,0),category.articles.length-1);
  const article=category.articles[articleIndex];
  const steps=article[2].map((step,index)=>`<li><b>${index+1}</b><div><strong>${step}</strong><p>${['按照页面提示进入对应功能区域。','确认当前账号与操作对象是否正确。','完成后页面会给出相应的状态反馈。'][index]||'按照页面提示完成操作。'}</p></div></li>`).join('');
  const related=category.articles.filter((_,index)=>index!==articleIndex).slice(0,3).map((item,index)=>`<a href="#/help-article?category=${categoryKey}&article=${category.articles.indexOf(item)}"><span>${String(index+1).padStart(2,'0')}</span><strong>${item[0]}</strong>${icon('chevron',14)}</a>`).join('');
  return `<section class="help-subpage"><nav class="help-breadcrumb"><a href="#/help">帮助中心</a>${icon('chevron',13)}<a href="#/help-category?category=${categoryKey}">${category.title}</a>${icon('chevron',13)}<span>问题详情</span></nav><div class="help-article-layout"><article class="help-article panel"><header><span>${category.title}</span><h1>${article[0]}</h1><p>${article[1]}</p><div><small>更新于 2026年9月5日</small><i></i><small>约 3 分钟阅读</small></div></header><section id="overview"><h2>功能说明</h2><p>${article[1]} 本页面展示标准操作流程，实际使用时请根据当前账号权限和页面提示完成操作。</p><div class="help-article-tip">${icon('info',17)}<span><strong>温馨提示</strong>企业版和个人版的数据相互隔离，操作前请先确认左侧底部显示的当前账号。</span></div></section><section id="steps"><h2>操作步骤</h2><ol>${steps}</ol></section><section id="notice"><h2>注意事项</h2><ul><li>部分企业功能仅对具有相应权限的成员显示。</li><li>当前项目为交互演示原型，不会提交或产生真实业务数据。</li><li>如果仍未解决问题，可以前往意见反馈页面联系我们。</li></ul></section><footer><div><strong>这篇内容对你有帮助吗？</strong><small>你的反馈会帮助我们改进帮助内容</small></div><button data-toast="感谢你的反馈">${icon('check',15)} 有帮助</button><button data-toast="已记录，我们会继续改进">没有帮助</button></footer></article><aside class="help-article-side"><section class="panel help-toc"><h3>本页目录</h3><button class="active" data-toast="已定位到功能说明">功能说明</button><button data-toast="已定位到操作步骤">操作步骤</button><button data-toast="已定位到注意事项">注意事项</button></section><section class="panel help-related"><h3>相关问题</h3>${related}</section><a class="help-feedback-entry" href="#/feedback">${icon('chat',18)}<span><strong>问题仍未解决？</strong><small>提交意见反馈</small></span>${icon('arrow',14)}</a></aside></div></section>`;
}

function helpCenterPage() {
  const category=helpCatalog[helpCurrentCategory]||helpCatalog.beginner;
  helpCurrentArticle=Math.min(helpCurrentArticle,category.articles.length-1);
  const article=category.articles[helpCurrentArticle];
  const tree=Object.entries(helpCatalog).map(([key,item])=>{
    const active=key===helpCurrentCategory;
    const children=active?`<div class="help-tree-children">${item.articles.map((entry,index)=>`<button class="help-tree-article ${index===helpCurrentArticle?'active':''}" data-help-article="${index}" data-search="${entry[0]} ${entry[1]}"><i></i><span>${entry[0]}</span></button>`).join('')}</div>`:'';
    return `<section class="help-tree-group ${active?'active':''}"><button class="help-tree-category" data-help-category="${key}"><span>${icon(item.icon,17)}</span><strong>${item.title}</strong><small>${item.total}</small>${icon('chevron',13)}</button>${children}</section>`;
  }).join('');
  const steps=article[2].map((step,index)=>`<li><b>${index+1}</b><div><strong>${step}</strong><p>${['按照页面提示进入对应功能区域。','确认当前账号与操作对象是否正确。','完成后页面会给出相应的状态反馈。'][index]||'按照页面提示完成操作。'}</p></div></li>`).join('');
  return `<section class="help-workbench"><header class="help-workbench-search"><div><span>HUANXIN HELP CENTER</span><h1>帮助中心</h1><p>搜索帮助内容，或从下方分类中选择问题</p></div><label>${icon('search',20)}<input id="help-global-search" placeholder="搜索问题，例如：如何雇佣智能体"><button data-toast="已为你筛选当前分类中的相关问题">搜索</button></label></header><div class="help-workbench-layout"><aside class="help-tree panel"><div class="help-tree-head"><div><strong>问题分类</strong><small>共 44 篇帮助内容</small></div><span>${icon('book',18)}</span></div><div class="help-tree-scroll">${tree}</div><a href="#/feedback">${icon('chat',17)}<span><strong>没有找到答案？</strong><small>提交问题反馈</small></span>${icon('arrow',14)}</a></aside><article class="help-workbench-detail panel"><header><div><span>${category.title}</span><small>更新于 2026年9月5日 · 约 3 分钟阅读</small></div><h1>${article[0]}</h1><p>${article[1]}</p></header><section><h2>功能说明</h2><p>${article[1]} 本页面展示标准操作流程，实际使用时请根据当前账号权限和页面提示完成操作。</p><div class="help-article-tip">${icon('info',17)}<span><strong>温馨提示</strong>企业版和个人版的数据相互隔离，操作前请确认左侧底部显示的当前账号。</span></div></section><section><h2>操作步骤</h2><ol>${steps}</ol></section><section><h2>注意事项</h2><ul><li>部分企业功能仅对具有相应权限的成员显示。</li><li>当前项目为交互演示原型，不会提交或产生真实业务数据。</li><li>如果仍未解决问题，可以通过意见反馈页面联系我们。</li></ul></section><footer><div><strong>这篇内容对你有帮助吗？</strong><small>你的反馈会帮助我们持续改进</small></div><button data-toast="感谢你的反馈">${icon('check',15)} 有帮助</button><button data-toast="已记录，我们会继续改进">没有帮助</button></footer></article></div></section>`;
}

function feedbackPage() {
  return `<section class="feedback-page">
    ${pageHead('意见反馈','你的建议会帮助我们持续改进幻馨 AI 的使用体验')}
    <div class="feedback-layout">
      <section class="feedback-form panel"><div class="feedback-form-head"><span>${icon('chat',22)}</span><div><h2>告诉我们遇到的问题</h2><p>请尽量完整地描述问题，我们会认真阅读每一条反馈。</p></div><em>预计 2 分钟</em></div>
        <div class="feedback-field"><label><b>*</b> 反馈类型</label><div class="feedback-types"><button class="active" data-feedback-type>功能异常</button><button data-feedback-type>体验问题</button><button data-feedback-type>功能建议</button><button data-feedback-type>其他反馈</button></div></div>
        <div class="feedback-field"><label for="feedback-content"><b>*</b> 问题描述</label><div class="feedback-textarea"><textarea id="feedback-content" maxlength="500" placeholder="请描述你遇到的问题、操作步骤以及期望的结果……"></textarea><span><i id="feedback-count">0</i>/500</span></div></div>
        <div class="feedback-field"><label>添加截图 <small>选填，最多 4 张</small></label><button class="feedback-upload" data-toast="请选择需要上传的截图（原型演示）">${icon('plus',23)}<span>上传图片</span><small>PNG、JPG，不超过 10MB</small></button></div>
        <div class="feedback-field"><label for="feedback-contact">联系方式 <small>选填，便于我们与你联系</small></label><input id="feedback-contact" class="feedback-input" placeholder="请输入手机号或邮箱"></div>
        <div class="feedback-actions"><button class="btn" data-action="feedback-reset">清空内容</button><button class="btn primary" data-action="feedback-submit">${icon('send',16)} 提交反馈</button></div>
      </section>
      <aside class="feedback-side"><section class="feedback-guide panel"><span class="feedback-side-icon">${icon('info',21)}</span><h3>这样反馈更高效</h3><ul><li><i>1</i><span><strong>描述操作场景</strong><small>告诉我们你在哪个页面进行了什么操作</small></span></li><li><i>2</i><span><strong>说明实际结果</strong><small>描述出现的现象或与预期不一致的地方</small></span></li><li><i>3</i><span><strong>添加相关截图</strong><small>截图可以帮助我们更快定位问题</small></span></li></ul></section><section class="feedback-status panel"><span>${icon('check',20)}</span><div><strong>每条反馈都会被查看</strong><small>产品团队会定期整理并评估用户建议</small></div></section><section class="feedback-help panel"><small>遇到紧急问题？</small><strong>前往帮助中心查找答案</strong><a href="#/help">打开帮助中心 ${icon('arrow',14)}</a></section></aside>
    </div>
  </section>`;
}

function directoryPage() {
  return `${pageHead('企业通讯录', '统一管理企业成员信息与组织架构', `<button class="btn primary" data-action="add-member">${icon('plus',16)} 添加企业成员</button>`)}
    <div class="panel directory-toolbar"><div class="input-wrap" style="min-width:290px"><input class="input" id="directory-search" placeholder="搜索姓名、手机号或邮箱" />${icon('search',18)}</div><select class="select" id="directory-status"><option value="all">全部状态</option><option value="active">启用</option><option value="inactive">停用</option></select><span class="summary">当前共 <strong id="directory-count">${directoryMembers.length}</strong> 位成员</span></div>
    <div class="directory-layout"><section class="panel table-panel"><div class="org-head"><h3 id="directory-title">全部成员</h3><span>成员信息由企业管理员维护</span></div><div class="data-table-wrap" id="directory-table-wrap"><table class="data-table directory-table"><thead><tr><th>成员</th><th>所属部门</th><th>联系方式</th><th>状态</th><th>操作</th></tr></thead><tbody id="directory-rows">${directoryRows(directoryMembers)}</tbody></table></div><div class="directory-empty" id="directory-empty" hidden>${icon('search',28)}<strong>没有找到相关成员</strong><span>请尝试更换关键词或筛选条件</span></div>${pagination()}</section>
    <aside class="panel org-panel"><div class="org-head"><h3>组织架构</h3><span>${directoryDepartments.length-2} 个部门</span></div><div class="org-tree">${directoryDepartments.map((d,i)=>`<button class="org-row ${directoryDept===d[0]?'active':''} ${i===0?'':d[2]==='产品研发中心'?'level-2':'level-1'}" data-directory-dept="${d[0]}">${icon(i===0?'building':'folder',16)}<span>${i===0?'幻馨智能科技':d[0]}</span><span>${departmentMemberCount(d[0])}</span></button>`).join('')}</div><button class="btn org-manage" data-action="manage-org">＋ 管理组织架构</button></aside></div>`;
}

function directoryRows(rows) {
  return rows.map(m=>{const i=directoryMembers.indexOf(m);return `<tr><td><div class="member-cell"><div class="member-avatar" style="background:${m.color}">${m.name.slice(-2)}</div><div class="member-copy"><strong>${m.name}</strong><small>${m.role || m.permission || '普通成员'}</small></div></div></td><td>${m.dept}</td><td class="contact-cell"><span>${m.phone}</span><small>${m.email}</small></td><td><span class="employment ${m.active?'':'inactive'}">${m.active?'启用':'停用'}</span></td><td class="member-action-cell"><button class="icon-btn" data-member-menu="${i}" aria-label="${m.name}操作">${icon('more',18)}</button></td></tr>`}).join('');
}

function renderDirectoryMembers() {
  const rows = document.querySelector('#directory-rows'); if (!rows) return;
  const query = (document.querySelector('#directory-search')?.value || '').trim().toLowerCase();
  const status = document.querySelector('#directory-status')?.value || 'all';
  const children = directoryDept === '产品研发中心' ? ['产品部','技术部'] : [];
  const filtered = directoryMembers.filter(m => {
    const matchesDept = directoryDept === '全部成员' || m.dept === directoryDept || children.includes(m.dept);
    const matchesQuery = !query || `${m.name} ${m.phone} ${m.email} ${m.role}`.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || (status === 'active' ? m.active : !m.active);
    return matchesDept && matchesQuery && matchesStatus;
  });
  rows.innerHTML = directoryRows(filtered);
  document.querySelector('#directory-count').textContent = filtered.length;
  document.querySelector('#directory-title').textContent = directoryDept;
  document.querySelector('#directory-table-wrap').hidden = filtered.length === 0;
  document.querySelector('#directory-empty').hidden = filtered.length > 0;
  document.querySelectorAll('[data-directory-dept]').forEach(x=>x.classList.toggle('active',x.dataset.directoryDept===directoryDept));
}

function memberDepartmentOptions(selected='') {
  return directoryDepartments.filter(d=>!['全部成员','产品研发中心'].includes(d[0])).map(d=>`<option ${d[0]===selected?'selected':''}>${d[0]}</option>`).join('');
}

function openMemberModal(index=null) {
  editingMemberIndex = index;
  const member = index === null ? {} : directoryMembers[index];
  const roles = ['企业管理员','部门管理员','普通成员'];
  modal(index === null ? '添加企业成员' : '修改企业成员', `<div class="member-form-grid"><div class="field"><label>姓名 <b class="required-mark">*</b></label><input id="new-member-name" value="${member.name||''}" placeholder="请输入成员姓名" required></div><div class="field"><label>手机号 <b class="required-mark">*</b></label><input id="new-member-phone" value="${member.phone||''}" placeholder="请输入11位手机号" required></div><div class="field"><label>企业邮箱</label><input id="new-member-email" value="${member.email||''}" placeholder="name@company.com"></div><div class="field"><label>所属部门 <b class="required-mark">*</b></label><select id="new-member-dept" required><option value="">请选择部门</option>${memberDepartmentOptions(member.dept)}</select></div><div class="field full"><label>角色 <b class="required-mark">*</b></label><select id="new-member-role" required><option value="">请选择角色</option>${roles.map(r=>`<option ${r===(member.permission||'普通成员')?'selected':''}>${r}</option>`).join('')}</select></div></div><p class="form-error" id="member-form-error"></p>`, index === null ? '确认添加' : '保存修改', 'member-done');
}

function openOrgManager() {
  modal('管理组织架构', `<p class="org-manager-note">按企业层级管理部门；有下级部门或关联成员的部门不可删除。</p><div class="org-department-list"><div class="org-company-root">${icon('building',18)}<strong>幻馨智能科技</strong><small>${directoryMembers.length} 位成员</small></div><div id="org-department-list">${orgDepartmentRows()}</div></div><section class="add-department-box"><strong>新建部门</strong><div class="add-department-row"><input id="new-department-name" placeholder="请输入部门名称"><select id="new-department-parent"><option>幻馨智能科技</option><option>产品研发中心</option></select><button class="btn primary" data-action="create-department">添加部门</button></div><p class="form-error" id="department-error"></p></section>`, '完成', 'org-done');
}

function departmentMemberCount(name) {
  if(name==='全部成员') return directoryMembers.length;
  if(name==='产品研发中心') return directoryMembers.filter(m=>['产品部','技术部'].includes(m.dept)).length;
  return directoryMembers.filter(m=>m.dept===name).length;
}

function orgDepartmentRows() {
  return directoryDepartments.slice(1).map(d=>{const index=directoryDepartments.indexOf(d);const count=departmentMemberCount(d[0]);const hasChildren=directoryDepartments.some(child=>child[2]===d[0]);const locked=count>0||hasChildren;return `<div class="org-department-item ${d[2]==='产品研发中心'?'level-2':'level-1'}" data-org-index="${index}"><span class="org-tree-line"></span>${icon('folder',17)}<div class="org-department-copy"><strong>${d[0]}</strong><small>${count} 位成员 · 上级：${d[2]}</small></div><div class="org-department-actions"><button class="btn" data-action="org-edit" data-index="${index}">编辑</button><button class="btn danger" data-action="org-delete" data-index="${index}" ${locked?'disabled title="有下级部门或关联成员，不可删除"':''}>删除</button></div></div>`}).join('');
}

function renderOrgDepartmentList(){const list=document.querySelector('#org-department-list');if(list)list.innerHTML=orgDepartmentRows()}

function roleManagementPage() {
  return `${pageHead('角色管理', '配置企业角色及其功能与数据访问权限', `<button class="btn primary" data-action="new-role">${icon('plus',16)} 新建角色</button>`)}
    <div class="panel role-toolbar"><div class="input-wrap"><input class="input" id="role-search" placeholder="搜索角色名称" />${icon('search',18)}</div><select class="select" id="role-status"><option value="all">全部状态</option><option value="active">启用</option><option value="inactive">停用</option></select><span>共 <strong id="role-count">${roleRecords.length}</strong> 个角色</span></div>
    <div class="panel table-panel"><div class="data-table-wrap"><table class="data-table role-table"><thead><tr><th>角色名称</th><th>角色描述</th><th>操作权限</th><th>数据访问权限</th><th>状态</th><th>操作</th></tr></thead><tbody id="role-rows">${roleRows(roleRecords)}</tbody></table></div><div class="directory-empty" id="role-empty" hidden>${icon('search',28)}<strong>没有找到相关角色</strong><span>请尝试更换关键词或状态</span></div>${pagination()}</div>`;
}

function roleRows(rows) {
  return rows.map(role=>{const index=roleRecords.indexOf(role);return `<tr><td><div class="role-name">${icon('key',18)}<strong>${role.name}</strong></div></td><td class="role-description">${role.description||'—'}</td><td><div class="permission-tags">${role.modules.slice(0,2).map(x=>`<span>${x}</span>`).join('')}${role.modules.length>2?`<b>+${role.modules.length-2}</b>`:''}</div></td><td><span class="scope-tag">${role.dataScope}</span></td><td><button class="switch ${role.active?'on':''}" data-role-toggle="${index}" aria-label="${role.name}${role.active?'已启用':'已停用'}"></button><small class="role-status-text">${role.active?'启用':'停用'}</small></td><td><div class="role-actions"><button class="btn" data-role-edit="${index}">修改</button><button class="btn danger" data-role-delete="${index}">删除</button></div></td></tr>`}).join('');
}

function renderRoles() {
  const body=document.querySelector('#role-rows'); if(!body)return;
  const query=(document.querySelector('#role-search')?.value||'').trim().toLowerCase();
  const status=document.querySelector('#role-status')?.value||'all';
  const filtered=roleRecords.filter(r=>(!query||`${r.name} ${r.description}`.toLowerCase().includes(query))&&(status==='all'||(status==='active'?r.active:!r.active)));
  body.innerHTML=roleRows(filtered);document.querySelector('#role-count').textContent=filtered.length;document.querySelector('.role-table').hidden=filtered.length===0;document.querySelector('#role-empty').hidden=filtered.length>0;
}

function openRoleModal(index=null) {
  editingRoleIndex=index;const role=index===null?{name:'',description:'',modules:[],dataScope:'本人',active:true}:roleRecords[index];
  const modules=['商家首页','对话工作台','静态知识库','动态知识库','企业通讯录','角色管理','账户余额','安全说明'];
  const scopes=['本人','本人及下属','本部门','全部'];
  modal(index===null?'新建角色':'修改角色',`<div class="field"><label>角色名称 <b class="required-mark">*</b></label><input id="role-name" value="${role.name}" placeholder="请输入角色名称"></div><div class="field"><label>角色描述</label><textarea id="role-description" placeholder="描述该角色的职责和使用范围">${role.description}</textarea></div><section class="permission-section"><div class="permission-title"><strong>操作权限</strong><span>勾选该角色可以访问的功能模块</span></div><div class="module-checks">${modules.map(m=>`<label><input type="checkbox" data-role-module value="${m}" ${role.modules.includes(m)||role.modules.includes('全部模块')?'checked':''}>${m}</label>`).join('')}</div></section><section class="permission-section"><div class="permission-title"><strong>数据访问权限</strong><span>设置该角色可以查看的数据范围</span></div><div class="scope-options">${scopes.map(s=>`<label class="scope-option"><input type="radio" name="data-scope" value="${s}" ${role.dataScope===s?'checked':''}><span>${s}</span></label>`).join('')}</div></section><p class="form-error" id="role-form-error"></p>`,index===null?'创建角色':'保存修改','role-done');
}

function agentTeamPage() {
  const hiredAgents = [...hiredMarketAgents[currentAccount]].map(index=>({agent:marketAgents[index],index}));
  const clusterCount = new Set(hiredAgents.map(({agent})=>agent.group)).size;
  const isEnterprise = currentAccount === 'enterprise';
  const currentAccessRole = isEnterprise ? '普通成员' : '本人';
  const availableAgents = hiredAgents.filter(({index})=>(agentAccessibleRoles[currentAccount][index]||[]).includes(currentAccessRole));
  const unavailableAgents = hiredAgents.filter(({index})=>!(agentAccessibleRoles[currentAccount][index]||[]).includes(currentAccessRole));
  const renderTeamCard = ({agent,index}, unavailable=false)=>{
    const group = marketClusters[agent.group];
    const executionCount = agentExecutionCounts[currentAccount][index] || 0;
    const usage = agent.customerService ? `${icon('headset',13)}已绑定账号 ${customerServiceAccounts.length} 个` : `${icon('check',13)}任务执行 ${executionCount} 次`;
    const primaryAction = agent.customerService ? `<button class="btn agent-cs-connected" type="button" disabled>${icon('headset',15)}接入中</button>` : `<button class="btn primary" data-market-agent-action="task" data-agent-index="${index}">${icon('plus',15)}建任务</button>`;
    return `<article class="agent-market-card agent-team-card ${unavailable?'agent-team-card-unavailable':''}" style="--agent-color:${agent.color}" ${unavailable?'aria-disabled="true"':`data-market-agent-card="${index}" tabindex="0" aria-label="查看${agent.name}详情"`}><div class="agent-market-top"><div class="agent-market-avatar" style="--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div class="agent-market-name"><h3>${agent.name}</h3></div><span class="agent-cluster-badge" style="--cluster-color:${group.color};--cluster-soft:${group.soft}">${group.name}</span></div><p>${agent.intro}</p><div class="agent-market-tags">${agent.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><div class="agent-market-footer">${unavailable?`<small class="team-no-permission">${icon('shield',14)}当前角色暂无权限使用</small>`:`<small class="team-execution-count">${usage}</small><div class="agent-card-actions"><button class="icon-btn agent-card-more-trigger" data-agent-card-menu="${index}" aria-label="更多操作">${icon('more',18)}</button>${primaryAction}</div>`}</div></article>`;
  };
  const availableCards = availableAgents.map(item=>renderTeamCard(item)).join('');
  const unavailableCards = unavailableAgents.map(item=>renderTeamCard(item,true)).join('');
  const empty = `<div class="team-empty panel"><span>${icon('users',28)}</span><strong>当前还没有雇佣智能体</strong><p>前往智能体人才市场，选择适合你的智能体加入团队。</p><a class="btn primary" href="#/market">前往人才市场</a></div>`;
  const actions = `<a class="btn primary" href="#/market">${icon('grid',15)}雇佣更多智能体</a>`;
  const availableSection = availableAgents.length ? `<div class="agent-market-grid team-agent-grid">${availableCards}</div>` : `<div class="team-permission-empty panel">当前角色没有可使用的智能体</div>`;
  const unavailableSection = unavailableAgents.length ? `<section class="team-unavailable-section"><div class="team-section-title"><span>${icon('shield',18)}</span><div><strong>暂无权限使用</strong><small>以下智能体已被企业雇佣，但当前角色不在可访问角色范围内</small></div><em>${unavailableAgents.length} 个智能体</em></div><div class="agent-market-grid team-agent-grid team-unavailable-grid">${unavailableCards}</div></section>` : '';
  return `${pageHead('智能体团队',isEnterprise?'查看望湘园企业账号已经雇佣的智能体，快速发起协作任务':'查看个人账号已经雇佣的智能体，快速发起协作任务',actions)}<div class="team-overview panel"><span class="team-overview-icon">${icon('users',23)}</span><div><strong>${isEnterprise?'企业智能体团队':'个人智能体团队'}</strong><small>${isEnterprise?'当前展示望湘园企业账号的团队成员':'当前展示个人账号的团队成员'}</small></div><div class="team-overview-stats"><span><b>${hiredAgents.length}</b><small>已雇佣智能体</small></span><span><b>${clusterCount}</b><small>覆盖集群</small></span></div></div>${hiredAgents.length?availableSection+unavailableSection:empty}`;
}

function agentMarketPage() {
  const visibleAgents = marketAgents.map((agent,index)=>({agent,index})).filter(({agent})=>marketCategory==='all'||agent.group===marketCategory);
  const cards = visibleAgents.map(({agent,index})=>{
    const hired = hiredMarketAgents[currentAccount].has(index);
    const group = marketClusters[agent.group];
    const monthlyPrice = agent.cluster ? '199' : '39';
    const firstMonthPrice = agent.cluster ? '99' : '9.9';
    const subscription = agent.customerService
      ? `<div class="agent-subscription agent-subscription-cs"><div class="subscription-normal"><small>套餐订阅费</small><span><strong>¥100</strong>/月起</span></div><div class="subscription-offer"><small>支持账号数量</small><strong>1–50 个</strong></div><em>多档套餐</em></div>`
      : `<div class="agent-subscription"><div class="subscription-normal"><small>标准订阅费</small><span><strong>¥${monthlyPrice}</strong>/月</span></div><div class="subscription-offer"><small>首月订阅优惠</small><strong>¥${firstMonthPrice}</strong></div><em>限时优惠</em></div>`;
    const actionButton = hired && agent.customerService
      ? `<button class="btn agent-cs-connected" type="button" disabled>${icon('headset',15)}接入中</button>`
      : `<button class="btn ${hired?'':'primary'}" data-market-agent-action="${hired?'task':'hire'}" data-agent-index="${index}">${hired?icon('plus',15):icon('user',15)}${hired?'建任务':'雇佣'}</button>`;
    return `<article class="agent-market-card ${agent.customerService?'agent-market-card-cs':''}" style="--agent-color:${agent.color}" data-market-agent-card="${index}" tabindex="0" aria-label="查看${agent.name}详情"><div class="agent-market-top"><div class="agent-market-avatar" style="--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div class="agent-market-name"><h3>${agent.name}</h3></div><span class="agent-cluster-badge" style="--cluster-color:${group.color};--cluster-soft:${group.soft}">${group.name}</span></div><p>${agent.intro}</p><div class="agent-market-tags">${agent.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>${subscription}<div class="agent-market-footer"><small>${hired?'已加入智能体团队':'可立即雇佣使用'}</small><div class="agent-card-actions">${hired?`<button class="icon-btn agent-card-more-trigger" data-agent-card-menu="${index}" aria-label="更多操作">${icon('more',18)}</button>`:''}${actionButton}</div></div></article>`;
  }).join('');
  const clusterFilters = Object.entries(marketClusters).map(([key,group])=>`<button class="market-category ${marketCategory===key?'active':''}" style="--cluster-color:${group.color};--cluster-soft:${group.soft}" data-market-category="${key}">${group.name}</button>`).join('');
  return `${pageHead('智能体人才市场','发现适合业务场景的智能体人才，快速组建你的 AI 团队')}<div class="market-category-bar"><button class="market-category ${marketCategory==='all'?'active':''}" data-market-category="all">全部</button>${clusterFilters}<span>共 ${visibleAgents.length} 个智能体</span></div><div class="agent-market-grid">${cards}</div>`;
}

function openAgentSubscription(index) {
  pendingMarketAgentIndex = index;
  const agent = marketAgents[index];
  const balance = accountBalances[currentAccount];
  if(agent.customerService){
    pendingCustomerServicePlanIndex = 2;
    const plans = customerServicePlans.map((plan,planIndex)=>`<button type="button" class="agent-cs-plan ${planIndex===pendingCustomerServicePlanIndex?'active':''}" data-action="select-agent-cs-plan" data-plan-index="${planIndex}">${plan.recommended?'<em>推荐</em>':''}<strong>${plan.accounts}个号</strong><span>¥${plan.price} / 月</span><small>${plan.description}</small></button>`).join('');
    const selectedPlan = customerServicePlans[pendingCustomerServicePlanIndex];
    modal('选择 AI 客服套餐', `<div class="subscribe-agent-head"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><span>按可绑定的个人微信账号数量选择套餐</span></div></div><div class="agent-cs-plan-picker"><div class="agent-cs-plan-title"><strong>选择套餐档位</strong><span>订阅后可在 AI 智能客服中绑定对应数量的个人微信</span></div><div class="agent-cs-plan-grid">${plans}</div></div><div class="agent-cs-payment-summary"><div><small>已选套餐</small><strong id="agent-cs-plan-name">${selectedPlan.accounts} 个号</strong></div><div><small>本次支付</small><strong id="agent-cs-plan-price">¥${selectedPlan.price}</strong></div></div><p class="subscribe-note">套餐按月订阅，可在管理绑定账号中启用、停用或修改知识库权限。本页面仅作原型展示，不会发起真实扣款。</p><div class="subscribe-payment-title"><strong>支付方式</strong><span>仅支持账户余额</span></div><label class="subscribe-payment selected"><input type="radio" checked name="subscribe-payment"><span class="subscribe-wallet">${icon('wallet',19)}</span><div><strong>余额支付</strong><small>当前可用余额 ¥${balance.toFixed(2)}</small></div><em id="agent-cs-balance-status" class="${balance>=selectedPlan.price?'enough':'insufficient'}">${balance>=selectedPlan.price?'余额充足':'余额不足'}</em></label>`, `余额支付 ¥${selectedPlan.price}`, 'subscribe-agent');
    return;
  }
  const monthlyPrice = agent.cluster ? 199 : 39;
  const firstMonthPrice = agent.cluster ? 99 : 9.9;
  modal('订阅智能体', `<div class="subscribe-agent-head"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><span>${agent.cluster?'智能体集群':'专业智能体'}</span></div></div><div class="subscribe-price"><div><small>标准订阅费</small><strong>¥${monthlyPrice}<i>/月</i></strong></div><span>${icon('arrow',17)}</span><div class="subscribe-first"><small>首月订阅优惠</small><strong>¥${firstMonthPrice}</strong></div></div><p class="subscribe-note">首月按优惠价支付，次月起按标准订阅费续订。本页面仅作原型展示，不会发起真实扣款。</p><div class="subscribe-payment-title"><strong>支付方式</strong><span>仅支持账户余额</span></div><label class="subscribe-payment selected"><input type="radio" checked name="subscribe-payment"><span class="subscribe-wallet">${icon('wallet',19)}</span><div><strong>余额支付</strong><small>当前可用余额 ¥${balance.toFixed(2)}</small></div><em>${balance>=firstMonthPrice?'余额充足':'余额不足'}</em></label>`, `余额支付 ¥${firstMonthPrice}`, 'subscribe-agent');
}

function openAgentRoleAccess(index, price) {
  pendingMarketAgentIndex = index;
  pendingMarketAgentPrice = price;
  const agent = marketAgents[index];
  const roles = currentAccount === 'enterprise' ? roleRecords.filter(role=>role.active) : [{name:'本人',description:'个人账号本人可访问',active:true}];
  const selected = agentAccessibleRoles[currentAccount][index] || [roles[0].name];
  const roleOptions = roles.map(role=>`<label class="agent-role-option"><input type="checkbox" data-agent-access-role value="${escapeHtml(role.name)}" ${selected.includes(role.name)?'checked':''}><span>${icon('key',17)}</span><div><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.description||'允许该角色访问并使用此智能体')}</small></div><em>可访问</em></label>`).join('');
  const plan = agent.customerService ? customerServicePlans[pendingCustomerServicePlanIndex] : null;
  const paymentLabel = plan ? `${plan.accounts} 个号套餐 · 订阅费用 ¥${price}` : `首月订阅费用 ¥${price}`;
  modal('设置可访问角色', `<div class="agent-role-access"><div class="agent-role-payment-done">${icon('check',18)}<div><strong>余额支付已确认</strong><small>${paymentLabel} · 完成角色设置后正式生效</small></div><em>步骤 2/2</em></div><div class="agent-role-head"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><small>请选择可以查看和使用该智能体的角色，可多选</small></div></div><div class="agent-role-options">${roleOptions}</div><p class="form-error" id="agent-role-error"></p></div>`, '完成设置并加入团队', 'agent-role-done');
}

function openAgentRoleEditor(index) {
  pendingMarketAgentIndex = index;
  const agent = marketAgents[index];
  const roles = currentAccount === 'enterprise' ? roleRecords.filter(role=>role.active) : [{name:'本人',description:'个人账号本人可访问',active:true}];
  const selected = agentAccessibleRoles[currentAccount][index] || [];
  const roleOptions = roles.map(role=>`<label class="agent-role-option"><input type="checkbox" data-agent-access-role value="${escapeHtml(role.name)}" ${selected.includes(role.name)?'checked':''}><span>${icon('key',17)}</span><div><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.description||'允许该角色访问并使用此智能体')}</small></div><em>可访问</em></label>`).join('');
  modal('修改访问角色', `<div class="agent-role-access agent-role-edit"><div class="agent-role-edit-note">${icon('info',17)}<span>修改后将立即更新当前账号中可以查看和使用该智能体的角色。</span></div><div class="agent-role-head"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><small>重新选择可访问角色，至少选择一个角色</small></div></div><div class="agent-role-options">${roleOptions}</div><p class="form-error" id="agent-role-error"></p></div>`, '保存修改', 'agent-role-update');
}

function openAgentDismissal(index) {
  pendingMarketAgentIndex = index;
  const agent = marketAgents[index];
  modal('解雇智能体', `<div class="dismiss-agent-confirm"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>确定解雇“${agent.name}”吗？</strong><p>解雇后，该智能体将从智能体团队中移除，无法继续创建新任务；已经产生的任务记录仍会保留。解雇后的订阅费退款将原路返回，T+1到账。</p></div></div>`, '确认解雇', 'dismiss-agent');
}

function openAgentDetail(index) {
  pendingMarketAgentIndex = index;
  const agent = marketAgents[index];
  const hired = hiredMarketAgents[currentAccount].has(index);
  const monthlyPrice = agent.cluster ? 199 : 39;
  const firstMonthPrice = agent.cluster ? 99 : 9.9;
  const customerServicePlan = agent.customerService ? (agentSubscriptionPlans[currentAccount][index] || customerServicePlans[2]) : null;
  const skills = agent.cluster ? ['任务智能拆解','多智能体协同执行','结果汇总与质量检查'] : [`${agent.tags[0]}分析`,`${agent.tags[1]}方案生成`,`${agent.tags[2]}结果输出`];
  const accessibleRoles = agentAccessibleRoles[currentAccount][index] || [];
  const subscriptionFee = customerServicePlan ? customerServicePlan.price : monthlyPrice;
  const planDetail = customerServicePlan ? `<div class="agent-access-roles"><small>当前套餐</small><div><span class="agent-access-role-tag">${customerServicePlan.accounts} 个号套餐</span></div></div>` : '';
  const hireDetail = hired ? `<section class="agent-hire-detail"><div class="agent-hire-detail-head"><div><strong>雇佣详情</strong><span>当前账号的订阅与访问权限</span></div><em><i></i>订阅生效中</em></div><div class="agent-hire-meta"><div class="agent-hire-meta-item"><small>雇佣时间</small><strong>${agentHireTimes[currentAccount][index] || '2026年9月9日'}</strong></div><div class="agent-hire-meta-item"><small>订阅状态</small><strong class="agent-subscription-active">已启用</strong></div><div class="agent-hire-meta-item"><small>订阅费用</small><strong>¥${subscriptionFee}<span>/月</span></strong></div></div>${planDetail}<div class="agent-access-roles"><small>可访问角色</small><div>${accessibleRoles.map(role=>`<span class="agent-access-role-tag">${escapeHtml(role)}</span>`).join('') || '<span class="agent-access-role-tag">暂未设置</span>'}</div></div></section>` : '';
  const detailPrice = agent.customerService
    ? '<div class="agent-detail-price"><small>套餐订阅费</small><strong>¥100起</strong><span>1–50 个号可选</span></div>'
    : `<div class="agent-detail-price"><small>首月优惠</small><strong>¥${firstMonthPrice}</strong><span>次月 ¥${monthlyPrice}/月</span></div>`;
  const detailConfirm = hired ? (agent.customerService?'接入中':'建任务') : '雇佣智能体';
  const detailAction = hired && agent.customerService ? 'close-modal' : 'detail-agent-action';
  modal('智能体详情', `<div class="agent-detail-body"><div class="agent-detail-hero" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><div class="agent-market-avatar"><img src="${agent.avatar}" alt="${agent.name}"></div><div><div class="agent-detail-name"><strong>${agent.name}</strong>${agent.cluster?'<em>智能体集群</em>':'<em>专业智能体</em>'}</div><p>${agent.intro}</p><div class="agent-market-tags">${agent.tags.map(tag=>`<span>${tag}</span>`).join('')}</div></div>${detailPrice}</div>${hireDetail}<section class="agent-detail-section"><div class="agent-detail-title"><strong>内置技能</strong><span>${skills.length} 项专业能力</span></div><div class="agent-skill-grid">${skills.map((skill,i)=>`<div><span>${icon(['trend','file','check'][i],18)}</span><strong>${skill}</strong><small>${['识别业务问题并形成关键洞察','根据目标快速生成可执行方案','整理过程数据并输出结构化结果'][i]}</small></div>`).join('')}</div></section><section class="agent-detail-section"><div class="agent-detail-title"><strong>调用方法</strong><span>${hired?'当前账号已雇佣，可直接使用':'雇佣后即可使用以下方式调用'}</span></div><div class="agent-call-list"><div><b>1</b><span><strong>对话调用</strong><small>进入“新对话”，输入 <em>@${agent.name}</em> 和你的问题。</small></span></div><div><b>2</b><span><strong>任务调用</strong><small>点击“建任务”，填写任务目标、所需资料和交付要求。</small></span></div></div></section></div>`,detailConfirm,detailAction);
  if(hired&&agent.customerService){const confirm=document.querySelector('.modal-actions .btn.primary');if(confirm){confirm.disabled=true;confirm.classList.add('agent-cs-connected')}}
}

function agentTaskSteps(agent) {
  const scopeOptions = currentAccount === 'enterprise' ? ['单个门店','多个门店','全部门店','先做小范围试点'] : ['当前事项','一个项目','多个项目','先生成示例'];
  return [
    { label:'任务事项', prompt:'我可以帮你完成下面这些事情，请选择一个作为本次任务的目标。', options:agentTaskCapabilities[agent.group] },
    { label:'执行范围', prompt:'好的，这次任务主要针对哪个范围？', options:scopeOptions },
    { label:'参考资料', prompt:'执行任务时，需要我优先使用哪些资料？', options:['企业知识库资料','本次任务说明','结合公开信息','暂不指定资料'] },
    { label:'交付形式', prompt:'最后，请选择你希望收到的交付形式。', options:['执行清单','详细分析报告','表格或数据摘要','可直接使用的文案'] }
  ];
}

function renderAgentTaskWizard() {
  if(!agentTaskWizard)return;
  const agent = marketAgents[agentTaskWizard.index];
  const steps = agentTaskSteps(agent);
  const currentStep = agentTaskWizard.answers.length;
  const finished = currentStep >= steps.length;
  const dialog = document.querySelector('.modal-backdrop .modal');
  if(!dialog)return;
  dialog.classList.add('agent-task-modal');
  const progress = finished ? 100 : Math.round(((currentStep+1)/steps.length)*100);
  let conversation = `<div class="task-message ai"><span>AI</span><div><strong>${agent.name}</strong><p>${steps[0].prompt}</p></div></div>`;
  agentTaskWizard.answers.forEach((answer,index)=>{
    conversation += `<div class="task-message user"><div><p>${escapeHtml(answer)}</p></div></div>`;
    if(index+1<steps.length)conversation += `<div class="task-message ai"><span>AI</span><div><strong>${agent.name}</strong><p>${steps[index+1].prompt}</p></div></div>`;
  });
  if(finished)conversation += `<div class="task-message ai"><span>AI</span><div><strong>${agent.name}</strong><p>信息已经足够，我已为你整理好任务。确认后即可开始执行。</p></div></div>`;
  const options = finished ? '' : `<div class="task-option-grid">${steps[currentStep].options.map((option,index)=>`<button type="button" data-task-choice="${index}">${escapeHtml(option)}${icon('chevron',14)}</button>`).join('')}</div><div class="task-custom-input"><input id="task-custom-requirement" type="text" maxlength="200" autocomplete="off" placeholder="也可以输入你的定制化需求"><button type="button" data-action="task-custom-submit" aria-label="提交定制化需求">${icon('send',15)}<span>发送</span></button></div>`;
  const summary = finished ? `<div class="task-summary"><div class="task-summary-title">${icon('check',16)}<strong>任务信息已准备完成</strong></div>${steps.map((step,index)=>`<div><span>${step.label}</span><strong>${escapeHtml(agentTaskWizard.answers[index])}</strong></div>`).join('')}<div><span>执行智能体</span><strong>${agent.name}</strong></div></div>` : '';
  dialog.querySelector('.modal-body').innerHTML = `<div class="agent-task-wizard"><div class="task-agent-head"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><small>正在协助你创建任务</small></div><em>${finished?'信息已完整':`第 ${currentStep+1}/${steps.length} 步`}</em></div><div class="task-progress"><i style="width:${progress}%"></i></div><div class="task-conversation">${conversation}</div>${options}${summary}</div>`;
  dialog.querySelector('.modal-actions').innerHTML = finished
    ? `<button class="btn" data-action="close-modal">取消</button><button class="btn" data-action="task-wizard-back">上一步</button><button class="btn primary" data-action="market-task-done">开始执行任务</button>`
    : `<button class="btn" data-action="close-modal">取消</button>${currentStep?'<button class="btn" data-action="task-wizard-back">上一步</button>':''}`;
}

function customerServiceMessage(message, thread) {
  const isAgent = message.from === 'agent';
  const avatar = isAgent ? './assets/agent-avatar-05.jpg' : thread.avatar;
  const name = isAgent ? '幻馨 AI 客服' : thread.name;
  let body = '';
  if(message.type === 'file') body = `<button class="cs-file-message" data-toast="原型演示：正在预览文件"><span>${icon('file',21)}</span><div><strong>${escapeHtml(message.name)}</strong><small>Excel · ${message.size}</small></div>${icon('download',16)}</button>`;
  if(message.type === 'voice') body = `<button class="cs-voice-message" data-toast="原型演示：正在播放语音"><span>${icon('voice',18)}</span><i></i><i></i><i></i><i></i><strong>${message.duration}</strong></button>`;
  if(message.type === 'text') body = `<div class="cs-text-message">${escapeHtml(message.content)}</div>`;
  return `<article class="cs-message-item ${isAgent?'agent':''}" data-message-search="${escapeHtml(`${name} ${message.content||message.name||''}`)}"><img src="${avatar}" alt="${name}"><div class="cs-message-main"><header><strong>${name}</strong><time>${message.time}</time>${isAgent?'<em>AI 回复</em>':''}</header>${body}</div></article>`;
}

function customerServicePage() {
  const account = customerServiceAccounts[customerServiceBoundAccount] || customerServiceAccounts[0];
  const accountActive = account.working&&account.knowledgeBases?.length;
  const thread = customerServiceThreads[customerServiceThread] || customerServiceThreads[0];
  const accountThreads = account.threadIndexes.map(index=>({item:customerServiceThreads[index],index}));
  const threadSource = customerServiceMode === 'recent' ? accountThreads.slice(0,2) : accountThreads;
  const typeLabels = [['all','全部'],['text','文本'],['image','图片'],['voice','语音'],['video','视频'],['file','文件'],['call','音视频通话'],['redpacket','红包'],['link','链接']];
  const visibleMessages = customerServiceMessageType === 'all' ? thread.messages : thread.messages.filter(message=>message.type===customerServiceMessageType);
  const workingAccountCount = customerServiceAccounts.filter(item=>item.working&&item.knowledgeBases?.length).length;
  const empty = `<div class="cs-message-empty">${icon('chat',28)}<strong>暂无此类型消息</strong><span>切换其他筛选项查看会话内容</span></div>`;
  return `<div class="customer-service-page">
    <aside class="cs-conversation-panel">
      <div class="cs-current-account"><span style="--account-color:${account.color};--account-soft:${account.soft}">${account.mark}</span><div><small>当前客服账号</small><strong>${account.name}</strong><em>${account.platform}</em></div><b class="${accountActive?'working':'paused'}">${accountActive?'工作中':'已暂停'}</b></div>
      <div class="cs-list-tabs"><button class="${customerServiceMode==='recent'?'active':''}" data-cs-mode="recent">最近</button><button class="${customerServiceMode==='history'?'active':''}" data-cs-mode="history">历史会话</button></div>
      <label class="cs-search"><input id="cs-thread-search" placeholder="搜索客户或会话"><span>${icon('search',16)}</span></label>
      <div class="cs-thread-list">${threadSource.map(({item,index})=>`<button class="cs-thread ${customerServiceThread===index?'active':''}" data-cs-thread="${index}" data-search="${escapeHtml(`${item.name} ${item.channel} ${item.last}`)}"><span class="cs-thread-avatar"><img src="${item.avatar}" alt="${item.name}"><i></i></span><span class="cs-thread-copy"><strong>${item.name}<em>${item.channel}</em></strong><small>${item.last}</small></span>${item.unread?`<b>${item.unread}</b>`:''}</button>`).join('')}</div>
      <footer><span><i></i> AI 客服在线</span><small>今日已接待 ${account.today} 位客户</small></footer>
    </aside>
    <section class="cs-chat-panel">
      <header class="cs-chat-header"><div class="cs-contact"><span><img src="${thread.avatar}" alt="${thread.name}"><i></i></span><div><strong>${thread.name}</strong><small>${thread.channel} · <em>${thread.tag}</em></small></div></div><div class="cs-chat-tools"><label><input id="cs-message-search" placeholder="搜索聊天内容">${icon('search',16)}</label><label class="cs-date-filter"><input type="date" aria-label="选择日期">${icon('calendar',16)}</label><button class="icon-btn" data-toast="更多会话操作">${icon('more',18)}</button></div></header>
      <nav class="cs-message-types">${typeLabels.map(([type,label])=>`<button class="${customerServiceMessageType===type?'active':''}" data-cs-message-type="${type}">${label}</button>`).join('')}</nav>
      <div class="cs-message-list"><div class="cs-day-divider"><span>2026年9月8日</span></div>${visibleMessages.length?visibleMessages.map(message=>customerServiceMessage(message,thread)).join(''):empty}</div>
      <footer class="cs-reply"><div class="cs-reply-tools"><button data-toast="原型演示：选择表情">☺</button><button data-toast="原型演示：上传文件">${icon('file',17)}</button><button data-toast="原型演示：发送图片">${icon('image',17)}</button><span>AI 自动回复已开启</span></div><textarea id="cs-reply-input" placeholder="输入回复内容，Enter 发送，Shift + Enter 换行"></textarea><div class="cs-reply-foot"><small>回复由 AI 生成，请注意核对关键信息</small><button data-action="cs-send">${icon('send',15)}发送</button></div></footer>
    </section>
    <aside class="cs-account-panel">
      <header><div><strong>已绑定账号</strong></div><button class="icon-btn" data-action="cs-bind-account" aria-label="绑定客服账号">${icon('plus',18)}</button></header>
      <div class="cs-account-plan-limit">当前套餐最多可以绑定<strong>3</strong>个账号</div>
      <div class="cs-account-stats"><div><strong>${customerServiceAccounts.length}</strong><span>已绑定账号</span></div><i></i><div><strong>${workingAccountCount}</strong><span>工作中</span></div></div>
      <div class="cs-account-list">${customerServiceAccounts.map((item,index)=>{const active=item.working&&item.knowledgeBases?.length;return `<button class="cs-bound-account ${customerServiceBoundAccount===index?'active':''}" data-cs-account="${index}"><span class="cs-bound-mark" style="--account-color:${item.color};--account-soft:${item.soft}">${item.mark}<i class="${active?'working':'paused'}"></i></span><span class="cs-bound-copy"><strong>${item.name}</strong><small>${item.platform} · 今日 ${item.today} 个会话</small></span><em class="${active?'working':'paused'}">${active?'工作中':'已暂停'}</em></button>`}).join('')}</div>
      <footer><button data-action="cs-manage-accounts">${icon('key',15)}管理绑定账号${icon('chevron',14)}</button></footer>
    </aside>
  </div>`;
}

function openAgentTask(index) {
  pendingMarketAgentIndex = index;
  agentTaskWizard = { index, answers:[] };
  modal('创建智能体任务','<div class="agent-task-wizard"></div>','取消','close-modal');
  renderAgentTaskWizard();
}

function staticKnowledgePage() {
  return `${pageHead('企业知识库', '上传企业资料，让智能体更懂你的业务', `<button class="btn" data-action="refresh">${icon('refresh',16)} 刷新</button><button class="btn primary" data-action="new-library">${icon('plus',16)} 新建知识库</button>`)}
    <div class="tabs"><button class="tab active">静态知识库</button><button class="tab" data-nav="/dynamic-kb">动态知识库 <small style="color:#e76d83">AI Agent</small></button></div>
    <div class="notice" style="margin-top:14px">${icon('shield',17)} <strong>平台福利月：</strong>知识库智能体免费体验，不收取 token 费用。赶快上传资料来体验吧。</div>
    ${knowledgeFilters()}
    <div class="library-grid" id="library-grid">${staticLibraries.map(staticCard).join('')}</div>`;
}

function dynamicKnowledgePage() {
  return `${pageHead('企业知识库', '智能采集外部信息，及时追踪市场动态', `<button class="btn" data-action="refresh">${icon('refresh',16)} 刷新</button><button class="btn primary" data-action="new-library">${icon('plus',16)} 新建知识库</button>`)}
    <div class="tabs"><button class="tab" data-nav="/static-kb">内部知识库</button><button class="tab active">外部知识库 <small style="color:#e76d83">AI Agent</small></button></div>
    <div style="height:14px"></div>${knowledgeFilters()}
    <div class="library-grid" id="library-grid">${dynamicLibraries.map(dynamicCard).join('')}<div class="panel promo-card"><h3>智能体可以<span>帮你盯着竞争对手</span></h3><p>想要更多智能体？</p><a href="#/chat">点击查看 &nbsp;›</a></div></div>`;
}

function knowledgeFilters() {
  return `<div class="panel filters"><div class="input-wrap"><input class="input" id="library-search" placeholder="请输入知识库名称" />${icon('search',18)}</div><select class="select"><option>访问角色：全部</option><option>全体员工</option><option>市场部</option></select><span class="sorter">文档数量 <b>↕</b></span><span class="sorter">存储大小 <b>↕</b></span><span class="sorter">创建时间 <b>↕</b></span></div>`;
}

function staticCard(item) {
  return `<article class="panel library-card" data-name="${item[0]}"><button class="icon-btn more-btn" data-toast="知识库操作菜单">${icon('more',18)}</button><a href="#/static-files"><div class="lib-top"><span class="folder-icon">${icon('folder',28)}</span><h3>${item[0]}</h3></div><p class="lib-desc">${item[1]}</p><div class="lib-meta"><strong>13 个文档</strong> ｜ 5 个启用中<br>管理员：周杰伦<br>存储&nbsp; 560mb <span class="lib-role">访问角色：${item[2]}</span></div></a></article>`;
}

function dynamicCard(name) {
  return `<article class="panel library-card dynamic" data-name="${name}"><button class="icon-btn more-btn" data-toast="知识库操作菜单">${icon('more',18)}</button><a href="#/dynamic-files"><div class="lib-top"><span class="folder-icon">${icon('folder',28)}</span><h3>${name}</h3></div><p class="lib-desc">更新时间：2026/8/20 19:20</p><div class="lib-meta"><strong>22 个文档</strong> ｜ 560mb<br>管理员：周杰伦<br>存储&nbsp; 560mb <span class="lib-role">访问角色：全体员工</span></div></a></article>`;
}

function fileListPage(type) {
  const isStatic = type === 'static'; const title = isStatic ? '公共文件' : '产品情报';
  return `${pageHead(title, isStatic ? '管理知识库中的资料与启用状态' : '配置监控信源与自动更新频率', `<button class="btn" data-toast="已导出当前列表">${icon('file',16)} 导出</button><button class="btn primary" data-action="${isStatic ? 'upload-file' : 'new-source'}">${icon(isStatic ? 'upload' : 'plus',16)} ${isStatic ? '上传文件' : '新建文件'}</button>`)}
    <div class="panel filters"><div class="input-wrap"><input class="input" id="file-search" placeholder="输入文件名称" />${icon('search',18)}</div>${isStatic ? '<select class="select"><option>解析状态：全部</option><option>解析中</option><option>已完成</option></select>' : ''}<button class="btn" data-action="refresh">${icon('refresh',16)} 刷新</button><button class="btn" data-action="reset-search">重置</button></div>
    <div class="panel table-panel"><div class="selection-bar">已选中 <strong id="selected-count">${selectedFiles.size}</strong> 项 <button class="btn">批量启用</button><button class="btn">批量禁用</button><button class="btn danger" data-toast="演示模式不会删除文件">批量删除</button><button class="btn" data-action="clear-selection">取消选择</button></div>${isStatic ? staticTable() : dynamicTable()}${pagination()}</div>`;
}

function staticTable() {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th><input type="checkbox" data-action="select-all" /></th><th>文件名</th><th>文件类型</th><th>文件大小</th><th>解析状态</th><th>调用次数</th><th>启用状态</th><th>上传人</th><th>上传时间</th></tr></thead><tbody>${staticFiles.map((r,i)=>`<tr data-file-row data-name="${r[0]}"><td><input type="checkbox" class="row-check" data-index="${i}" ${selectedFiles.has(i)?'checked':''}></td><td class="file-name">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="status ${r[3]==='解析中'?'loading':''}">${r[3]}</span></td><td>${r[4]}</td><td><button class="switch ${switches.get('s'+i)===false?'':'on'}" data-switch="s${i}" aria-label="启用状态"></button></td><td>张运营_1</td><td>2035-06-19 09:39:19</td></tr>`).join('')}</tbody></table></div>`;
}

function dynamicTable() {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th><input type="checkbox" data-action="select-all" /></th><th>文件名</th><th>文件大小</th><th>信源</th><th>更新频次</th><th>调用次数</th><th>启用状态</th><th>智能体</th><th>最近更新时间</th><th>操作</th></tr></thead><tbody>${dynamicFiles.map((r,i)=>`<tr data-file-row data-name="${r[0]}"><td><input type="checkbox" class="row-check" data-index="${i}" ${selectedFiles.has(i)?'checked':''}></td><td class="file-name">${r[0]}</td><td>${r[1]}</td><td>https://www.smec-cn.com/case/</td><td>${r[2]}</td><td>${r[3]}</td><td><button class="switch ${switches.get('d'+i)===false?'':'on'}" data-switch="d${i}"></button></td><td>爬虫智能体-小智</td><td>2035-06-19 09:39:19</td><td><button class="btn" data-action="edit-source">修改</button></td></tr>`).join('')}</tbody></table></div>`;
}

function pagination(){ return `<div class="pagination"><span style="color:#99a2b0;font-size:12px;margin-right:12px">10 条/页</span>${[1,2,3,4,5].map(n=>`<button class="page-num ${n===1?'active':''}">${n}</button>`).join('')}</div>`; }

function balancePage() {
  const isPersonal = currentAccount === 'personal';
  return `${pageHead(isPersonal?'账号信息':'账户信息',isPersonal?'查看个人账号余额和收支记录':'查询您的充值和消费记录',`<button class="btn primary" data-action="recharge">立即充值</button>`)}<div class="balance-grid"><div class="panel balance-card"><span class="balance-label">账户余额 <span class="warn-tag">余额不足</span></span><p class="balance-copy">余额可用于 token 消耗、支付智能体薪资、购买算力套餐、抵扣知识库空间费用、API 接口调用等</p><p class="balance-amount">${accountBalances[currentAccount].toFixed(2)}</p><button class="btn" data-action="recharge">立即充值</button></div><div class="panel chart-card"><div class="chart-title">近7天消耗</div>${bars()}</div></div><div class="panel table-panel"><div class="tabs"><button class="tab active" data-balance-tab="consume">消费明细</button><button class="tab" data-balance-tab="recharge">充值记录</button></div><div id="balance-table">${consumeTable()}</div>${isPersonal?'':pagination()}</div>`;
}

function bars(){ const hs=[18,72,36,96,57,10,41]; return `<div class="bars">${hs.map((h,i)=>`<div class="bar-wrap"><div class="bar" style="height:${h}px"></div>${19+i}</div>`).join('')}</div>`; }
function consumeTable(){return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th style="text-align:left">时间</th><th>消费金额(元)</th><th>消费类型</th><th>客户端</th><th>消息ID</th><th>操作人</th></tr></thead><tbody>${currentAccount==='personal'?'<tr><td colspan="6" style="height:120px;text-align:center;color:#98a1af">暂无消费记录</td></tr>':consumption.map(r=>`<tr><td>2035-06-19 09:39:19</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>ee26f04a316b4ff4a871af2806e244d4</td><td>张运营_1</td></tr>`).join('')}</tbody></table></div>`}
function rechargeTable(){return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th style="text-align:left">时间</th><th>充值金额(元)</th><th>订单ID</th><th>操作人</th></tr></thead><tbody>${currentAccount==='personal'?'<tr><td colspan="4" style="height:120px;text-align:center;color:#98a1af">暂无充值记录</td></tr>':[100,500,1000].map((n,i)=>`<tr><td>2035-06-${19-i} 09:39:19</td><td style="color:#25a77c">+${n}.00</td><td>HX20350619000${i+1}</td><td>张运营_1</td></tr>`).join('')}</tbody></table></div>`}

function securityPage() {
  return `<section class="security-hero"><span class="security-kicker">DATA SECURITY</span><div class="security-logo"><span class="mini-shield">${icon('shield',22)}</span><span>幻馨 ai<br><small>HUANXIN AI</small></span></div><h1>数据安全保障说明</h1><h2>DATA SECURITY OVERVIEW</h2><p>您的知识库数据如何被保护。HTTPS 加密传输、阿里云 WAF 云端防护、阿里云 OSS 隔离存储、PolarSearch 账号级检索隔离——六道防线逐层说明，欢迎逐条验证。</p><div class="security-pills"><span class="security-pill">六道安全防线</span><span class="security-pill">传输 · 存储 · 访问 三层保护</span><span class="security-pill">阿里云安全底座</span></div></section><section class="security-section"><h2><span>01</span>我们的安全承诺</h2><p>数据安全是本产品设计之初的第一优先级，而非事后补丁。您的资料从进入系统的那一刻起，就已进入多层防护之中。</p><div class="protection-grid">${[['shield','传输加密','全站 HTTPS 与 TLS 加密，防止数据在传输过程中被窃取。'],['folder','隔离存储','企业数据按租户独立存储，访问身份与权限全程校验。'],['trend','安全监控','实时风险监测与审计日志，异常访问及时告警。']].map(x=>`<div class="panel protect">${icon(x[0],25)}<h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></section>`;
}

function chatPage() {
  return `<div class="new-chat-page"><section class="new-chat-empty"><div class="new-chat-ai">AI</div><h1>有什么可以帮你?</h1><p>输入问题后才会创建对话。刷新或点击“新对话”不会产生空记录。</p></section><section class="new-chat-compose"><div class="new-chat-compose-inner"><div class="new-chat-agent"><span>AI</span><strong>幻馨工作助手</strong><small>输入 @ 可切换智能体</small></div><div class="new-chat-input"><textarea id="chat-input" placeholder="输入消息，Enter 发送，@ 选择智能体"></textarea><button type="button" data-action="send-chat">发送</button></div><p>回答由智能体生成，请核对关键信息。</p></div></section></div>`;
}

function agentPicker(){return `<div class="agent-select"><button class="agent-trigger" data-action="toggle-agents"><span class="avatar" style="background:${agents[currentAgent][2]}">${agents[currentAgent][1][0]}</span>${agents[currentAgent][0]}⌃</button><div class="agent-menu hidden" id="agent-menu"><small>选择智能体</small>${agents.map((a,i)=>`<button class="agent-option ${i===currentAgent?'selected':''}" data-agent="${i}"><span class="avatar" style="background:${a[2]}">${a[1][0]}</span>${a[0]}${i===currentAgent?icon('check',15):''}</button>`).join('')}</div></div>`}

function chatResultPage() {
  const question = sessionStorage.getItem(`lastQuestion-${currentAccount}`) || (currentAccount === 'personal' ? '帮我规划今天的工作' : '美团活动怎么设置');
  return `<div class="chat-results"><div class="message-row user"><div class="bubble">${escapeHtml(question)}</div></div><div class="ai-message"><p>在美团上设置活动主要分为商家端（设置活动吸引顾客）和消费者端（参与/创建活动）两种情况。以下为您梳理了详细的操作指南：</p><h2>一、如果您是美团商家（设置店铺营销活动）</h2><p>商家可以通过美团管家 APP 或商家后台，针对不同场景设置多种促销活动：</p><h3>1. 设置“门店新客立减”（拉新必备）</h3><ul><li><strong>操作路径：</strong>打开【美团商家版】APP，依次点击【门店运营】-【活动配置】-【新客立减】。</li><li><strong>设置建议：</strong>活动金额通常设置在 1-5 元，能有效控制拉新成本。</li></ul><h3>2. 设置“整单折扣”（适合开业或会员回馈）</h3><ul><li><strong>操作路径：</strong>在工作台下滑找到【促销活动】，点击【新建促销活动】。</li><li><strong>设置细节：</strong>输入折扣并设置适用菜品、活动名称与时间。</li></ul><h3>3. 设置“折扣商品”（提升单品转化率）</h3><p>建议挑选 3-5 个高点击、高毛利商品参与，并关注活动后的复购数据。</p></div></div><div class="results-composer"><div class="composer"><textarea id="chat-input" placeholder="你可以向我提问"></textarea><div class="composer-foot">${agentPicker()}<div class="composer-actions"><button class="send-btn" data-action="send-chat">${icon('arrow',19)}</button></div></div></div></div>`;
}

function taskDetailPage() {
  const items = recentItems[currentAccount];
  const selectedIndex = selectedRecentIndexes[currentAccount];
  let task = items[selectedIndex];
  if(!task||task.type!=='task')task=items.find(item=>item.type==='task');
  if(!task)return `${pageHead('任务详情','查看智能体任务的执行信息')}<div class="team-empty panel"><span>${icon('task',28)}</span><strong>暂无任务记录</strong><p>创建任务后，可以在这里查看执行详情。</p></div>`;
  const agent = marketAgents[task.agentIndex];
  const group = marketClusters[agent.group];
  const statusClass = task.status==='已完成'?'done':task.status==='执行中'?'running':'waiting';
  const taskNumber = `HX-202609-${String(items.indexOf(task)+1).padStart(3,'0')}`;
  const statusCopy = task.status==='已完成'?'任务已经执行完成，交付内容已准备就绪。':task.status==='执行中'?`${agent.name} 正在分析资料并生成任务结果。`:'任务已进入执行队列，智能体即将开始处理。';
  const stages = ['理解任务目标','读取参考资料','智能体执行任务','整理交付结果'];
  const thresholds = [15,40,75,100];
  const firstPending = thresholds.findIndex(value=>task.progress<value);
  const timeline = stages.map((stage,index)=>{
    const state = task.progress>=thresholds[index]?'done':index===firstPending?'active':'';
    const descriptions = ['确认任务范围、交付形式和执行要求','从指定资料中提取与任务相关的信息','根据目标分析信息并生成任务内容','检查结果并整理为指定交付形式'];
    return `<div class="task-stage ${state}"><span>${state==='done'?icon('check',14):index+1}</span><div><strong>${stage}</strong><small>${descriptions[index]}</small></div><em>${state==='done'?'已完成':state==='active'?(task.status==='等待执行'?'等待开始':'进行中'):'待执行'}</em></div>`;
  }).join('');
  const activities = [
    { title:'任务信息已确认', text:`执行范围：${task.scope}，交付形式：${task.deliverable}`, time:'09:32', state:'done' },
    { title:'参考资料读取完成', text:`已从“${task.source}”中整理出 12 条相关信息`, time:'09:36', state:task.progress>=40?'done':'pending' },
    { title:task.status==='已完成'?'任务内容生成完成':'正在生成任务内容', text:`${agent.name} 正在进行${agent.tags[0]}分析与结果整理`, time:task.status==='已完成'?'09:48':'进行中', state:task.progress>=100?'done':task.progress>=40?'active':'pending' }
  ];
  const activityMarkup = activities.map(item=>`<div class="task-activity-item ${item.state}"><i></i><div><strong>${item.title}</strong><p>${item.text}</p></div><time>${item.time}</time></div>`).join('');
  const actions = `<button class="btn" data-toast="已提醒智能体关注当前任务">${icon('bell',15)}提醒智能体</button><button class="btn primary" data-market-agent-action="task" data-agent-index="${task.agentIndex}">${icon('plus',15)}再次创建任务</button>`;
  const deliveryState = task.status==='已完成'?'已生成':task.status==='执行中'?'生成中':'待生成';
  return `${pageHead('任务详情','跟踪智能体工作进度，集中查看任务过程与交付结果',actions)}
    <section class="task-hero-card" style="--cluster-color:${group.color};--cluster-soft:${group.soft}">
      <div class="task-hero-decoration"></div>
      <div class="task-hero-copy"><div class="task-hero-kicker"><span class="task-detail-status ${statusClass}"><i></i>${task.status}</span><em>任务编号 ${taskNumber}</em></div><h2>${task.title}</h2><p>${statusCopy}</p><div class="task-detail-agent"><div class="agent-market-avatar" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><img src="${agent.avatar}" alt="${agent.name}"></div><div><strong>${agent.name}</strong><small>${group.name}</small></div><span>创建于${task.time}</span></div></div>
      <div class="task-progress-ring" style="--task-progress:${task.progress*3.6}deg"><div><strong>${task.progress}%</strong><small>整体进度</small></div></div>
    </section>
    <div class="task-metric-grid">
      <div class="task-metric panel"><span>${icon('trend',18)}</span><div><small>执行进度</small><strong>${task.progress}%</strong></div><em class="${statusClass}">${task.status}</em></div>
      <div class="task-metric panel"><span>${icon('task',18)}</span><div><small>已执行时长</small><strong>${task.status==='等待执行'?'0 分钟':task.status==='已完成'?'28 分钟':'18 分钟'}</strong></div><em>自动执行</em></div>
      <div class="task-metric panel"><span>${icon('file',18)}</span><div><small>已处理资料</small><strong>${task.progress>=40?'12 份':'0 份'}</strong></div><em>${task.source}</em></div>
      <div class="task-metric panel"><span>${icon('check',18)}</span><div><small>预计完成</small><strong>${task.status==='已完成'?'已完成':task.status==='等待执行'?'等待中':'约 12 分钟'}</strong></div><em>系统预估</em></div>
    </div>
    <div class="task-detail-columns">
      <div class="task-detail-primary">
        <section class="task-flow panel"><div class="task-panel-head"><div><h3>执行流程</h3><p>智能体会按照以下步骤完成任务</p></div><span>${task.progress}%</span></div>${timeline}</section>
        <section class="task-activity panel"><div class="task-panel-head"><div><h3>智能体工作动态</h3><p>查看智能体最近的执行记录</p></div><em class="live-dot"><i></i>${task.status==='执行中'?'实时更新':'执行记录'}</em></div>${activityMarkup}</section>
      </div>
      <aside class="task-detail-secondary">
        <section class="task-config panel"><div class="task-panel-head"><div><h3>任务配置</h3><p>创建任务时收集的信息</p></div></div><dl><div><dt>执行范围</dt><dd>${task.scope}</dd></div><div><dt>参考资料</dt><dd>${task.source}</dd></div><div><dt>交付形式</dt><dd>${task.deliverable}</dd></div><div><dt>创建人</dt><dd>${currentAccount==='enterprise'?'周杰伦 · 望湘园':'周杰伦'}</dd></div></dl></section>
        <section class="task-delivery panel"><div class="task-panel-head"><div><h3>交付物</h3><p>任务完成后可查看和下载</p></div><span>${deliveryState}</span></div><button class="task-file" data-toast="${task.status==='已完成'?'正在打开交付文件':'交付文件仍在生成中'}"><i>${icon('file',19)}</i><span><strong>${task.title}.pdf</strong><small>分析报告 · ${deliveryState}</small></span>${icon('chevron',15)}</button><button class="task-file" data-toast="${task.status==='已完成'?'正在打开执行清单':'交付文件仍在生成中'}"><i>${icon('task',19)}</i><span><strong>任务执行清单.xlsx</strong><small>执行清单 · ${deliveryState}</small></span>${icon('chevron',15)}</button><div class="task-delivery-note">${icon('info',14)}当前为原型演示，交付文件不会真实生成。</div></section>
      </aside>
    </div>`;
}

function techTaskDetailPageAlignedBackup() {
  const items = recentItems[currentAccount];
  const selectedIndex = selectedRecentIndexes[currentAccount];
  let task = items[selectedIndex];
  if(!task||task.type!=='task')task=items.find(item=>item.type==='task');
  if(!task)return `<div class="tech-task-page"><div class="tech-empty">${icon('task',32)}<strong>暂无任务记录</strong><p>创建任务后，可在这里查看科技版任务控制台。</p></div></div>`;
  const agent = marketAgents[task.agentIndex];
  const group = marketClusters[agent.group];
  const statusClass = task.status==='已完成'?'done':task.status==='执行中'?'running':'waiting';
  const taskNumber = `HX-202609-${String(items.indexOf(task)+1).padStart(3,'0')}`;
  const stages = [
    ['01','目标解析','理解任务目标与边界',15],
    ['02','数据接入','读取并筛选参考资料',40],
    ['03','智能执行','多步骤分析与内容生成',75],
    ['04','质量校验','整理并检查交付结果',100]
  ];
  const firstPending = stages.findIndex(stage=>task.progress<stage[3]);
  const stageMarkup = stages.map((stage,index)=>{
    const state = task.progress>=stage[3]?'done':index===firstPending?'active':'';
    return `<div class="tech-stage ${state}"><span>${state==='done'?icon('check',15):stage[0]}</span><div><strong>${stage[1]}</strong><small>${stage[2]}</small></div><em>${state==='done'?'COMPLETE':state==='active'?'PROCESSING':'STANDBY'}</em></div>`;
  }).join('');
  const activityItems = [
    ['09:32:08','任务参数载入完成',`执行范围已锁定为「${task.scope}」`,'done'],
    ['09:35:42','知识上下文构建完成',`从${task.source}提取 12 条有效信息`,'done'],
    ['09:41:16',task.status==='已完成'?'内容生成与校验完成':'智能推理引擎运行中',`${agent.name} 正在执行${agent.tags[0]}分析`,task.status==='已完成'?'done':'active'],
    ['--:--:--','交付物封装',`目标格式：${task.deliverable}`,task.status==='已完成'?'done':'pending']
  ].map(item=>`<div class="tech-activity ${item[3]}"><time>${item[0]}</time><i></i><div><strong>${item[1]}</strong><small>${item[2]}</small></div><em>${item[3]==='done'?'OK':item[3]==='active'?'LIVE':'WAIT'}</em></div>`).join('');
  const deliveryState = task.status==='已完成'?'READY':task.status==='执行中'?'GENERATING':'STANDBY';
  return `<div class="tech-task-page" style="--tech-accent:${group.color}">
    <div class="tech-grid-bg"></div>
    <header class="tech-task-header"><div><span><i></i>AGENT TASK CONTROL</span><h1>任务执行控制台</h1><p>实时追踪智能体工作状态、运行链路与交付结果</p></div><div class="tech-header-actions"><a href="#/task-detail-backup">${icon('grid',15)}浅色备份版</a><button data-toast="已向智能体发送优先处理指令">${icon('bell',15)}提醒智能体</button><button class="primary" data-market-agent-action="task" data-agent-index="${task.agentIndex}">${icon('plus',15)}再次创建任务</button></div></header>
    <section class="tech-task-hero">
      <div class="tech-hud-corners"></div><div class="tech-scan-beam"></div><div class="tech-hero-glow"></div><div class="tech-task-copy"><div class="tech-task-meta"><span class="${statusClass}"><i></i>${task.status}</span><em>ID / ${taskNumber}</em><b>SECURE CHANNEL</b></div><h2>${task.title}</h2><p>${task.status==='已完成'?'任务执行链路已全部完成，交付文件已经准备就绪。':task.status==='执行中'?`${agent.name} 正在调用专业技能并生成任务结果。`:'任务已进入安全执行队列，等待智能体接入。'}</p><div class="tech-agent"><div><img src="${agent.avatar}" alt="${agent.name}"></div><span><strong>${agent.name}</strong><small>${group.name} · AI AGENT</small></span><em>创建于${task.time}</em></div></div>
      <div class="tech-hologram"><div class="holo-ring outer"></div><div class="holo-ring inner"></div><div class="holo-axis horizontal"></div><div class="holo-axis vertical"></div><div class="holo-avatar"><img src="${agent.avatar}" alt=""></div><i class="holo-node one"></i><i class="holo-node two"></i><i class="holo-node three"></i><strong>NEURAL AGENT</strong><small>SYNC RATE 99.8%</small></div>
      <div class="tech-core"><div class="tech-orbit one"></div><div class="tech-orbit two"></div><div class="tech-progress" style="--tech-progress:${task.progress*3.6}deg"><div><strong>${task.progress}</strong><span>%</span><small>SYSTEM PROGRESS</small></div></div><p><i></i>${task.status==='执行中'?'核心引擎运行中':task.status==='已完成'?'运行完成':'等待运行'}</p></div>
    </section>
    <div class="tech-metrics">
      <div><span>${icon('trend',18)}</span><small>COMPUTE PROGRESS</small><strong>${task.progress}%</strong><em>整体执行进度</em></div>
      <div><span>${icon('task',18)}</span><small>RUNNING TIME</small><strong>${task.status==='等待执行'?'00:00':task.status==='已完成'?'00:28':'00:18'}</strong><em>智能体运行时长</em></div>
      <div><span>${icon('file',18)}</span><small>DATA PROCESSED</small><strong>${task.progress>=40?'12':'0'} <b>份</b></strong><em>有效参考资料</em></div>
      <div><span>${icon('check',18)}</span><small>ESTIMATED TIME</small><strong>${task.status==='已完成'?'DONE':task.status==='等待执行'?'WAIT':'12 MIN'}</strong><em>系统智能预估</em></div>
    </div>
    <div class="tech-content-grid">
      <div class="tech-main-column">
        <section class="tech-panel tech-pipeline"><div class="tech-panel-head"><div><span>EXECUTION PIPELINE</span><h3>智能体执行链路</h3></div><em>${task.progress}% ONLINE</em></div><div class="tech-stage-list">${stageMarkup}</div></section>
        <section class="tech-panel tech-stream"><div class="tech-panel-head"><div><span>REAL-TIME STREAM</span><h3>实时工作动态</h3></div><em class="tech-live"><i></i>LIVE DATA</em></div><div class="tech-activity-list">${activityItems}</div></section>
      </div>
      <aside class="tech-side-column">
        <section class="tech-panel tech-parameters"><div class="tech-panel-head"><div><span>TASK PARAMETERS</span><h3>任务参数</h3></div>${icon('task',19)}</div><dl><div><dt>执行范围</dt><dd>${task.scope}</dd></div><div><dt>参考资料</dt><dd>${task.source}</dd></div><div><dt>交付形式</dt><dd>${task.deliverable}</dd></div><div><dt>创建人</dt><dd>${currentAccount==='enterprise'?'周杰伦 · 望湘园':'周杰伦'}</dd></div></dl></section>
        <section class="tech-panel tech-agent-card"><div class="tech-panel-head"><div><span>ACTIVE AGENT</span><h3>执行智能体</h3></div><em>ONLINE</em></div><div class="tech-agent-profile"><img src="${agent.avatar}" alt="${agent.name}"><strong>${agent.name}</strong><span>${group.name}</span><p>${agent.intro}</p><div>${agent.tags.map(tag=>`<small>${tag}</small>`).join('')}</div></div></section>
        <section class="tech-panel tech-delivery"><div class="tech-panel-head"><div><span>DELIVERABLES</span><h3>任务交付物</h3></div><em>${deliveryState}</em></div><button data-toast="${task.status==='已完成'?'正在打开交付文件':'交付文件仍在生成中'}"><i>${icon('file',18)}</i><span><strong>${task.title}.pdf</strong><small>REPORT / ${deliveryState}</small></span>${icon('chevron',15)}</button><button data-toast="${task.status==='已完成'?'正在打开执行清单':'交付文件仍在生成中'}"><i>${icon('task',18)}</i><span><strong>任务执行清单.xlsx</strong><small>CHECKLIST / ${deliveryState}</small></span>${icon('chevron',15)}</button></section>
      </aside>
    </div>
  </div>`;
}

function techTaskDetailPage() {
  const items = recentItems[currentAccount];
  const selectedIndex = selectedRecentIndexes[currentAccount];
  let task = items[selectedIndex];
  if(!task||task.type!=='task')task=items.find(item=>item.type==='task');
  if(!task)return `<div class="hud-free-page"><div class="hud-free-empty">${icon('task',30)}<strong>NO TASK SIGNAL</strong><p>暂无可显示的任务记录</p></div></div>`;
  const agent = marketAgents[task.agentIndex];
  const group = marketClusters[agent.group];
  const taskNumber = `HX-202609-${String(items.indexOf(task)+1).padStart(3,'0')}`;
  const stages = [
    ['01','目标解析',15],['02','数据接入',40],['03','智能执行',75],['04','质量校验',100]
  ];
  const firstPending = stages.findIndex(stage=>task.progress<stage[2]);
  const pipeline = stages.map((stage,index)=>{
    const state=task.progress>=stage[2]?'done':index===firstPending?'active':'';
    return `<div class="hud-pipe-step ${state}"><span>${state==='done'?icon('check',13):stage[0]}</span><strong>${stage[1]}</strong><em>${state==='done'?'COMPLETE':state==='active'?'RUNNING':'STANDBY'}</em></div>`;
  }).join('');
  const statusText = task.status==='已完成'?'MISSION COMPLETE':task.status==='执行中'?'TASK RUNNING':'TASK STANDBY';
  const deliveryState = task.status==='已完成'?'READY':'GENERATING';
  return `<div class="hud-free-page">
    <div class="hud-free-grid"></div><div class="hud-free-scan"></div>
    <div class="hud-free-canvas">
      <header class="hud-free-header"><div><span><i></i>HUANXIN AGENT SYSTEM</span><strong>任务智能控制中心</strong><small>NEURAL TASK OPERATING INTERFACE / V2.6</small></div><nav><a href="#/task-detail-backup">浅色备份</a><button data-toast="已向智能体发送优先处理指令">SIGNAL AGENT</button><button data-market-agent-action="task" data-agent-index="${task.agentIndex}">NEW TASK +</button></nav></header>

      <section class="hud-float hud-task-identity"><div class="hud-caption"><span>ACTIVE MISSION</span><em>${taskNumber}</em></div><h1>${task.title}</h1><p>${agent.name} 正在调用专业技能并生成任务结果</p><div><span class="hud-status"><i></i>${task.status}</span><small>SECURE CHANNEL / ENCRYPTED</small></div></section>

      <section class="hud-float hud-progress-module"><div class="hud-round-dial" style="--dial:${task.progress*3.6}deg"><div><strong>${task.progress}</strong><span>%</span><small>PROGRESS</small></div></div><p>${statusText}</p><div class="hud-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></section>

      <section class="hud-float hud-telemetry"><div class="hud-caption"><span>SYSTEM TELEMETRY</span><em>LIVE</em></div><dl><div><dt>RUNNING TIME</dt><dd>${task.status==='已完成'?'00:28:16':'00:18:42'}</dd></div><div><dt>DATA PROCESSED</dt><dd>${task.progress>=40?'12 FILES':'0 FILES'}</dd></div><div><dt>NEURAL LOAD</dt><dd>${task.status==='执行中'?'78.4%':'12.8%'}</dd></div><div><dt>OUTPUT ETA</dt><dd>${task.status==='已完成'?'COMPLETE':'12 MIN'}</dd></div></dl><div class="hud-load-bars">${[42,68,35,82,55,73,48,88,62,77,51,69].map(v=>`<i style="height:${v}%"></i>`).join('')}</div></section>

      <section class="hud-center-agent"><div class="hud-agent-label">ACTIVE AI AGENT <i></i></div><div class="hud-agent-radar one"></div><div class="hud-agent-radar two"></div><div class="hud-agent-head"><img src="${agent.avatar}" alt="${agent.name}"><span></span></div><div class="hud-agent-body"><i class="shoulder left"></i><i class="shoulder right"></i><div class="hud-agent-core"><span></span><strong>${task.progress}%</strong></div></div><div class="hud-agent-name"><strong>${agent.name}</strong><small>${group.name} / SYNC 99.8%</small></div></section>

      <section class="hud-float hud-parameters"><div class="hud-caption"><span>TASK PARAMETERS</span><em>LOCKED</em></div><dl><div><dt>执行范围</dt><dd>${task.scope}</dd></div><div><dt>参考资料</dt><dd>${task.source}</dd></div><div><dt>交付形式</dt><dd>${task.deliverable}</dd></div><div><dt>创建人</dt><dd>${currentAccount==='enterprise'?'周杰伦 · 望湘园':'周杰伦'}</dd></div></dl><div class="hud-coordinates"><span>LAT 31.2304° N</span><span>LON 121.4737° E</span></div></section>

      <section class="hud-float hud-stream"><div class="hud-caption"><span>NEURAL ACTIVITY STREAM</span><em><i></i>LIVE</em></div><ul><li class="done"><time>09:32:08</time><span>任务参数载入完成</span><b>OK</b></li><li class="done"><time>09:35:42</time><span>知识上下文构建完成</span><b>OK</b></li><li class="active"><time>09:41:16</time><span>${agent.tags[0]}分析与内容生成</span><b>RUN</b></li><li><time>--:--:--</time><span>${task.deliverable}封装</span><b>WAIT</b></li></ul></section>

      <section class="hud-float hud-pipeline"><div class="hud-caption"><span>EXECUTION SEQUENCE</span><em>${task.progress}% ONLINE</em></div><div>${pipeline}</div></section>

      <section class="hud-float hud-deliverables"><div class="hud-caption"><span>OUTPUT CHANNEL</span><em>${deliveryState}</em></div><button data-toast="${task.status==='已完成'?'正在打开交付文件':'交付文件仍在生成中'}">${icon('file',17)}<span><strong>${task.title}.pdf</strong><small>REPORT / ${deliveryState}</small></span></button><button data-toast="${task.status==='已完成'?'正在打开执行清单':'交付文件仍在生成中'}">${icon('task',17)}<span><strong>任务执行清单.xlsx</strong><small>CHECKLIST / ${deliveryState}</small></span></button></section>

      <div class="hud-link link-a"></div><div class="hud-link link-b"></div><div class="hud-link link-c"></div><div class="hud-node node-a"></div><div class="hud-node node-b"></div><div class="hud-node node-c"></div>
    </div>
  </div>`;
}

function loginPage() {
  return `<main class="login-page"><section class="login-showcase">${logo(true)}<h1>让每一家企业<br>都拥有自己的<span class="gradient-text">AI员工</span></h1><p>覆盖人事、客服、经营、连锁管理等核心场景，7×24 小时智能响应，让 AI 真正落地业务、创造价值。</p><div class="feature-grid">${[['AI人事','规章制度、操作流程随时解答，新人上手快，经验留得住。'],['AI客服','7×24小时在线，产品咨询、售后支持随问随答。'],['AI经营助理','不用天天开会听汇报，AI直接告诉你下一步怎么做。'],['AI连锁助理','总部标准直达每一家门店，管理不失控。']].map(x=>`<div class="feature-card"><strong>${x[0]}</strong><p>${x[1]}</p></div>`).join('')}</div><span class="login-copyright">Copyright © Huan Xin &nbsp; All Rights Reserved.</span></section><section class="auth-side"><div class="auth-card">${logo()}<h2>欢迎使用幻馨智能体</h2><p class="auth-sub">登录企业工作台，开启你的 AI 员工团队</p><div class="auth-tabs"><button class="auth-tab active" data-auth="login">手机号登录</button><button class="auth-tab" data-auth="register">注册企业</button></div><div id="auth-form">${loginForm()}</div></div></section></main>`;
}

function loginForm(){return `<div class="field"><label>手机号</label><input placeholder="请输入手机号" /></div><div class="field"><label>短信验证码</label><div class="code-row"><input placeholder="请输入短信验证码" /><button class="btn" data-action="get-code">获取验证码</button></div></div><label class="agree"><input type="checkbox" id="agree" /> <span>我已阅读并同意 <a href="#/agreement">《用户协议》</a> 和 <a href="#/privacy">《隐私政策》</a></span></label><button class="btn primary auth-submit" data-action="login">登 录</button><p class="auth-tip">首次使用？点击“注册企业”创建账号</p>`}
function registerForm(){return `<div class="field"><label>手机号</label><input placeholder="请输入手机号" /></div><div class="field"><label>短信验证码</label><div class="code-row"><input placeholder="请输入短信验证码" /><button class="btn" data-action="get-code">获取验证码</button></div></div><div class="field"><label>企业名称</label><input placeholder="请输入企业名称" /></div><div class="field"><label>设置密码</label><input type="password" placeholder="8-20位字母与数字组合" /></div><label class="agree"><input type="checkbox" id="agree" /> 我已阅读并同意 <a href="#/agreement">《用户协议》</a> 和 <a href="#/privacy">《隐私政策》</a></label><button class="btn primary auth-submit" data-action="register">注 册</button>`}

function articlePage(title, content){return `<main class="article-page"><article class="article-card"><header class="article-top"><button class="btn" data-action="back-login">← 返回</button><h1 style="margin-left:18px">${title}</h1>${logo()}</header>${content}<div class="article-date">生效日期：2025年09月02日<br>上海幻馨智能科技有限公司<br>更新日期：2026年9月1日</div></article></main>`}

const agreementContent = `<p class="lead">重要提示：在使用上海幻馨智能科技有限公司（以下简称“我方”）提供的全部产品及服务前，请您务必认真阅读本《用户协议》的全部条款。您注册账号、登录、浏览、使用我方智能设备、软件应用、平台服务等全部行为，即表示您已充分阅读、理解并自愿接受本协议全部约束。</p><h2>第一条 协议主体与适用范围</h2><p>本协议适用于甲方运营的所有智能硬件产品、软件客户端、官方网站、小程序、云端服务及衍生增值服务，涵盖注册、登录、使用、付费、售后、交互等全部服务场景。</p><h2>第二条 账号注册与用户信息</h2><p>用户在使用核心服务前，需按要求完成账号注册，如实、准确、完整填写手机号、实名认证等相关信息，并及时更新变更信息。用户账号、密码、设备绑定信息均由用户自行保管。</p><h2>第三条 服务内容与服务变更</h2><p>我方依托自身技术、设备、资源，为用户提供智能科技相关软硬件服务、云端数据服务、功能更新、技术维护、客户咨询等约定服务，并持续优化产品功能与服务体验。</p><h2>第四条 用户权利与义务</h2><p>用户可在遵守本协议及法律法规的前提下合规使用基础服务，享有账号信息及个人数据的合法权益。用户不得利用平台漏洞破解、篡改、侵入系统，不得发布、传播违法侵权信息。</p><h2>第五条 知识产权保护</h2><p>我方名下所有商标、专利、著作权、软件著作权、域名、界面设计、文案、代码、技术方案等知识产权均受法律保护。未经书面授权，不得擅自复制、传播、篡改、商用或反向编译。</p><h2>第六条 个人信息与隐私保护</h2><p>我方严格遵守个人信息保护相关法律法规，依法保护用户个人信息与隐私安全，具体规则详见《隐私政策》。</p><h2>第七条 付费服务规则</h2><p>部分增值功能、专属服务为付费项目，用户自愿选择购买，价格、服务期限、权益内容以平台实时公示为准。</p><h2>第八条 协议终止与争议解决</h2><p>用户可随时停止使用服务、申请注销账号。协议的订立、生效、履行、解释及争议解决均适用中华人民共和国大陆地区法律。</p>`;
const privacyContent = `<p class="lead">重要说明：上海幻馨智能科技有限公司高度重视用户的个人信息与隐私安全。本政策旨在向您清晰说明，我们如何收集、使用、存储、传输、保护、删除您的个人信息，以及您享有的隐私权利。</p><h2>一、主体与适用范围</h2><p>本政策适用于我方运营的全部智能硬件设备、移动端软件、电脑客户端、官方网站、微信小程序、云端后台服务、售后及增值服务等全场景个人信息处理活动。</p><h2>二、我们收集的信息</h2><p>我们仅基于合法、正当、必要、最小化原则收集账号注册与身份核验信息、设备与运行数据、服务交互与日志信息、付费与售后信息。头像、昵称、个人简介等属于可选信息。</p><h2>三、个人信息的使用规则</h2><p>所收集信息仅用于账号注册与安全风控、提供和优化服务、处理咨询与售后、订单履约、安全防护以及履行法律义务，不会超出授权范围使用。</p><h2>四、个人信息的存储与保护</h2><p>用户个人信息存储于中华人民共和国境内合规服务器。我们采用加密存储、访问权限管控、数据脱敏、安全审计、风险监控等措施，全方位保护信息安全。</p><h2>五、信息共享与披露</h2><p>未经您明确同意，我们不会向任何第三方出售、出租、泄露您的个人信息。法律法规、司法机关或监管部门依法要求的除外。</p><h2>六、您的个人信息权利</h2><p>您依法享有查询、更正、删除、撤回授权、账号注销和申诉权。我们将在合规范围内及时响应处理。</p><h2>七、未成年人信息保护</h2><p>未满18周岁的用户应在监护人知情、同意并指导下使用服务。若监护人发现未成年人未经许可提交个人信息，可联系我们处理。</p><h2>八、政策更新与联系方式</h2><p>我们可能依据法律法规、监管要求和业务发展修订本政策。若您发现信息安全问题，或需要行使个人信息权利，可通过官方客服渠道反馈。</p>`;

function escapeHtml(str){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function modal(title, body, confirm='确定', confirmAction='modal-confirm'){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-action="close-modal">${icon('close')}</button></div><div class="modal-body">${body}</div><div class="modal-actions"><button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="${confirmAction}">${confirm}</button></div></div></div>`);
}
function customerServiceQrCode(){
  const modules=[];const size=21;
  const finder=(x,y,ox,oy)=>x>=ox&&x<ox+7&&y>=oy&&y<oy+7&&((x===ox||x===ox+6||y===oy||y===oy+6)||(x>=ox+2&&x<=ox+4&&y>=oy+2&&y<=oy+4));
  const inFinder=(x,y)=>[[-1,-1],[13,-1],[-1,13]].some(([ox,oy])=>x>=ox&&x<=ox+8&&y>=oy&&y<=oy+8);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const fixed=finder(x,y,0,0)||finder(x,y,14,0)||finder(x,y,0,14);const random=!inFinder(x,y)&&(((x*7+y*11+x*y)%9)<4||(x+y)%11===0);if(fixed||random)modules.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`)}
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="客服账号绑定二维码" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#15243a">${modules.join('')}</g></svg>`;
}
function customerServiceKnowledgeOptions(items,selected,type){
  return items.map(item=>{const name=Array.isArray(item)?item[0]:item;return `<label class="cs-kb-option"><input type="checkbox" value="${escapeHtml(name)}" ${selected.includes(name)?'checked':''}><span class="cs-kb-check">${icon('check',13)}</span><span class="cs-kb-option-copy"><strong>${escapeHtml(name)}</strong><small>${type}</small></span></label>`}).join('');
}
function updateCustomerServiceKnowledgeCount(){
  const selected=document.querySelectorAll('.cs-kb-option input:checked').length;
  const count=document.querySelector('#cs-kb-selected-count');
  const error=document.querySelector('#cs-kb-error');
  if(count)count.textContent=`已选择 ${selected} 个知识库`;
  if(selected&&error)error.textContent='';
}
function openCustomerServiceKnowledgeBinding({accountIndex=null,province=''}={}){
  editingCustomerServiceKnowledgeIndex=accountIndex;
  pendingCustomerServiceProvince=province||pendingCustomerServiceProvince;
  const account=accountIndex===null?null:customerServiceAccounts[accountIndex];
  const selected=account?.knowledgeBases||[];
  const editing=Boolean(account);
  modal(editing?'修改可读取知识库':'配置可读取知识库',`<div class="cs-kb-binding"><div class="cs-kb-step"><span class="done">${icon('check',14)}</span><div><strong>${editing?'账号已绑定':'扫码绑定成功'}</strong><small>${editing?escapeHtml(account.name):`个人微信 · ${escapeHtml(pendingCustomerServiceProvince)}`}</small></div><i></i><span class="current">2</span><div><strong>配置知识库</strong><small>设置智能体可读取的数据范围</small></div></div><div class="cs-kb-notice">${icon('shield',17)}<div><strong>请选择此账号可以读取的知识库</strong><p>智能体只会使用已授权知识库中的内容。至少选择一个知识库，账号才能正常启用。</p></div></div><section class="cs-kb-group"><header><div><strong>企业知识库</strong><small>企业内部沉淀的文档与业务资料</small></div><em>${staticLibraries.length} 个</em></header><div class="cs-kb-options">${customerServiceKnowledgeOptions(staticLibraries,selected,'企业知识库')}</div></section><section class="cs-kb-group"><header><div><strong>动态知识库</strong><small>持续更新的外部信息与行业情报</small></div><em>${dynamicLibraries.length} 个</em></header><div class="cs-kb-options">${customerServiceKnowledgeOptions(dynamicLibraries,selected,'动态知识库')}</div></section><footer class="cs-kb-summary"><span id="cs-kb-selected-count">已选择 ${selected.length} 个知识库</span><em id="cs-kb-error"></em></footer></div>`,editing?'保存修改':'完成绑定',editing?'cs-account-knowledge-done':'cs-bind-knowledge-done');
}
function openCustomerServiceBinding(){
  pendingCustomerServiceProvince='';
  editingCustomerServiceKnowledgeIndex=null;
  modal('绑定个人微信',`<div class="cs-bind-account"><div class="cs-bind-region"><label for="cs-bind-province">所在省份 <b>*</b></label><select id="cs-bind-province"><option value="">请选择省份</option><option value="北京">北京</option><option value="天津">天津</option><option value="河北">河北</option><option value="山西">山西</option><option value="内蒙古">内蒙古</option><option value="辽宁">辽宁</option><option value="吉林">吉林</option><option value="黑龙江">黑龙江</option><option value="上海">上海</option><option value="江苏">江苏</option><option value="浙江">浙江</option><option value="安徽">安徽</option><option value="福建">福建</option><option value="江西">江西</option><option value="山东">山东</option><option value="河南">河南</option><option value="湖北">湖北</option><option value="湖南">湖南</option><option value="广东">广东</option><option value="广西">广西</option><option value="海南">海南</option><option value="重庆">重庆</option><option value="四川">四川</option><option value="贵州">贵州</option><option value="云南">云南</option><option value="西藏">西藏</option><option value="陕西">陕西</option><option value="甘肃">甘肃</option><option value="青海">青海</option><option value="宁夏">宁夏</option><option value="新疆">新疆</option><option value="台湾">台湾</option><option value="香港">香港</option><option value="澳门">澳门</option></select><small>只需选择微信账号所在省份，无需选择城市或区县。</small></div><div class="cs-bind-scan waiting"><div class="cs-bind-qr-placeholder">${icon('building',28)}<strong>请先选择所在省份</strong><span>选择后将显示微信绑定二维码</span></div><div class="cs-bind-qr hidden"><i></i>${customerServiceQrCode()}<span>${icon('refresh',14)}二维码 5 分钟内有效</span></div><div class="cs-bind-guide"><small>WECHAT CONNECTION</small><h4>使用<span>个人微信</span>扫码绑定</h4><ol><li><b>1</b><span>选择微信账号所在省份</span></li><li><b>2</b><span>使用需要绑定的个人微信扫码</span></li><li><b>3</b><span>在手机端确认授权并返回页面</span></li></ol><p>${icon('shield',14)}授权信息将被加密保存，可随时解除绑定</p></div></div></div>`,'我已完成扫码','cs-bind-done');
  const confirmButton=document.querySelector('[data-action="cs-bind-done"]');if(confirmButton)confirmButton.disabled=true;
}
function openCustomerServiceAccountManager(){
  const rows=customerServiceAccounts.map((item,index)=>{const knowledgeBases=item.knowledgeBases||[];const active=item.working&&knowledgeBases.length>0;const names=knowledgeBases.slice(0,2).map(escapeHtml).join('、');return `<div class="cs-manager-row"><span class="cs-manager-mark" style="--account-color:${item.color};--account-soft:${item.soft}">${item.mark}<i class="${active?'working':'paused'}"></i></span><div class="cs-manager-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.platform)} · 今日 ${item.today} 个会话</small><span class="cs-manager-kb">${icon('folder',13)}${knowledgeBases.length?`已授权 ${knowledgeBases.length} 个：${names}${knowledgeBases.length>2?' 等':''}`:'尚未配置可读取知识库'}</span></div><em class="${active?'working':'paused'}">${active?'已启用':'已停用'}</em><div class="cs-manager-actions"><button class="knowledge" data-action="cs-account-knowledge" data-index="${index}">修改知识库</button><button class="${active?'pause':'enable'}" data-action="cs-account-toggle" data-index="${index}">${active?'停用':'启用'}</button><button class="delete" data-action="cs-account-delete" data-index="${index}" ${customerServiceAccounts.length===1?'disabled title="至少保留一个绑定账号"':''}>删除</button></div></div>`}).join('');
  modal('管理绑定账号',`<div class="cs-account-manager"><div class="cs-manager-summary"><span>已绑定 <strong>${customerServiceAccounts.length}</strong> 个个人微信账号</span><span><i></i>${customerServiceAccounts.filter(item=>item.working&&item.knowledgeBases?.length).length} 个已启用</span></div><div class="cs-manager-list">${rows}</div><p class="cs-manager-tip">智能体只能读取账号已授权的知识库；停用后，该账号将暂停接收和处理新的客户消息。</p></div>`,'完成','close-modal');
}
function showAbout(){
  document.body.insertAdjacentHTML('beforeend',`<div class="about-backdrop"><section class="about-modal" role="dialog" aria-modal="true" aria-label="关于幻馨 AI"><button class="icon-btn about-close" data-action="close-about">${icon('close',22)}</button><div class="about-brand"><div class="about-app-logo">${logo(true)}</div></div><div class="about-info"><span>版本</span><strong>0.2.1</strong><span>发布日期</span><strong>2026–08–17</strong></div><footer class="about-footer">Copyright © 2026 上海幻馨智能科技有限公司</footer></section></div>`);
}
function openDynamicSourceModal(editing=false){
  const sourceUrlRow=(value='',removable=false)=>`<div class="source-url-row"><input type="url" value="${value}" placeholder="请输入信源 URL，例如：https://example.com"><button type="button" class="icon-btn source-url-remove ${removable?'':'hidden'}" data-action="remove-source-url" aria-label="删除信源 URL">${icon('close',15)}</button></div>`;
  modal(editing?'修改动态信息源':'谈价动态信息源',`<div class="dynamic-source-form"><div class="field"><label>文件名称</label><input placeholder="例如：竞品官网动态" value="${editing?'竞品价格动态':''}"></div><div class="field"><label>搜索关键词</label><input placeholder="请输入搜索关键词，多个关键词可用逗号分隔" value="${editing?'新品价格, 优惠活动':''}"><small class="dynamic-source-hint">系统将根据关键词持续检索并更新相关内容</small></div><div class="field"><label>信源 URL</label><div class="source-url-list" id="source-url-list">${sourceUrlRow(editing?'https://www.smec-cn.com/case/':'')}</div><button type="button" class="source-url-add" data-action="add-source-url">${icon('plus',15)}添加信源 URL</button></div><div class="field"><label>更新频次</label><select><option>每天</option><option>每3天</option><option>每7天</option></select></div></div>`,'保存','source-done');
}
function closeModal(){document.querySelector('.modal-backdrop')?.remove();agentTaskWizard=null;pendingCustomerServiceDeleteIndex=null;pendingMarketAgentPrice=null}
function toast(message){document.querySelector('.toast')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="toast">${icon('check',16)}&nbsp; ${message}</div>`);setTimeout(()=>document.querySelector('.toast')?.remove(),2200)}

document.addEventListener('click', e => {
  const actionEl=e.target.closest('[data-action]'); const navEl=e.target.closest('[data-nav]'); const toastEl=e.target.closest('[data-toast]');
  if(navEl) navigate(navEl.dataset.nav);
  if(toastEl) toast(toastEl.dataset.toast);
  const action=actionEl?.dataset.action;
  if(action==='menu'){document.querySelector('#sidebar')?.classList.toggle('open');if(document.querySelector('#sidebar')?.classList.contains('open')) document.body.insertAdjacentHTML('beforeend','<div class="menu-overlay" data-action="menu"></div>');else document.querySelector('.menu-overlay')?.remove()}
  if(action==='toggle-user-menu'){document.querySelector('#user-popover')?.classList.toggle('hidden');document.querySelector('.user-chevron').style.transform=document.querySelector('#user-popover')?.classList.contains('hidden')?'':'rotate(180deg)'}
  if(action==='toggle-running-tasks'){if(suppressRunningDockClick){suppressRunningDockClick=false;return}document.querySelector('#running-task-panel')?.classList.toggle('hidden');document.querySelector('#running-task-dock')?.classList.toggle('expanded',!document.querySelector('#running-task-panel')?.classList.contains('hidden'))}
  if(action==='toggle-account-switcher') document.querySelector('#account-switcher')?.classList.toggle('hidden');
  if(action==='about'){document.querySelector('#user-popover')?.classList.add('hidden');showAbout()}
  if(action==='logout-confirm'){document.querySelector('#user-popover')?.classList.add('hidden');modal('退出登录','<p style="margin:0;color:#596579;line-height:1.8">确定要退出当前账号吗？退出后将返回登录注册页面。</p>','确定退出','logout-done')}
  if(action==='logout-done'){closeModal();navigate('/login')}
  if(action==='close-about') document.querySelector('.about-backdrop')?.remove();
  if(action==='start-chat') navigate('/chat');
  if(action==='show-security') navigate('/security');
  if(action==='refresh') toast('内容已刷新');
  if(action==='cs-bind-account') openCustomerServiceBinding();
  if(action==='cs-manage-accounts') openCustomerServiceAccountManager();
  if(action==='cs-bind-done'){const province=document.querySelector('#cs-bind-province')?.value;if(!province){toast('请先选择所在省份');return}pendingCustomerServiceProvince=province;closeModal();openCustomerServiceKnowledgeBinding({province})}
  if(action==='cs-bind-knowledge-done'){const selected=[...document.querySelectorAll('.cs-kb-option input:checked')].map(item=>item.value);const error=document.querySelector('#cs-kb-error');if(!selected.length){if(error)error.textContent='请至少选择一个知识库';return}const number=customerServiceAccounts.length+1;const colors=[['#4b8ee8','#eaf3ff'],['#19a47a','#e8f8f1'],['#8062d5','#f1edff'],['#e47a4f','#fff0e9']];const [color,soft]=colors[number%colors.length];customerServiceAccounts.push({name:`个人微信客服－${number}`,platform:`个人微信 · ${pendingCustomerServiceProvince}`,mark:'新',color,soft,working:true,today:0,threadIndexes:[0,1],knowledgeBases:selected});customerServiceBoundAccount=customerServiceAccounts.length-1;customerServiceThread=customerServiceAccounts[customerServiceBoundAccount].threadIndexes[0];pendingCustomerServiceProvince='';editingCustomerServiceKnowledgeIndex=null;closeModal();render();toast(`个人微信绑定成功，已授权 ${selected.length} 个知识库`)}
  if(action==='cs-account-knowledge'){const index=Number(actionEl.dataset.index);if(!customerServiceAccounts[index])return;closeModal();openCustomerServiceKnowledgeBinding({accountIndex:index})}
  if(action==='cs-account-knowledge-done'){const index=editingCustomerServiceKnowledgeIndex;const account=customerServiceAccounts[index];const selected=[...document.querySelectorAll('.cs-kb-option input:checked')].map(item=>item.value);const error=document.querySelector('#cs-kb-error');if(!selected.length){if(error)error.textContent='请至少选择一个知识库';return}if(!account)return;account.knowledgeBases=selected;editingCustomerServiceKnowledgeIndex=null;closeModal();render();openCustomerServiceAccountManager();toast(`${account.name}的知识库权限已更新`)}
  if(action==='cs-account-toggle'){const index=Number(actionEl.dataset.index);const account=customerServiceAccounts[index];if(!account)return;if(!account.working&&(!account.knowledgeBases||!account.knowledgeBases.length)){toast('请先配置可读取的知识库');return}account.working=!account.working;const message=`${account.name}已${account.working?'启用':'停用'}`;closeModal();render();openCustomerServiceAccountManager();toast(message)}
  if(action==='cs-account-delete'){const index=Number(actionEl.dataset.index);const account=customerServiceAccounts[index];if(!account||customerServiceAccounts.length===1)return;closeModal();pendingCustomerServiceDeleteIndex=index;modal('删除绑定账号',`<div class="cs-delete-account-confirm"><span>!</span><div><strong>确定删除“${escapeHtml(account.name)}”吗？</strong><p>删除后将停止接收该微信账号的客户消息，原型中的历史会话不会被清除。</p></div></div>`,'确认删除','cs-account-delete-confirm')}
  if(action==='cs-account-delete-confirm'){const index=pendingCustomerServiceDeleteIndex;if(index===null||!customerServiceAccounts[index])return;const name=customerServiceAccounts[index].name;customerServiceAccounts.splice(index,1);if(customerServiceBoundAccount>index)customerServiceBoundAccount-=1;else if(customerServiceBoundAccount===index)customerServiceBoundAccount=Math.min(index,customerServiceAccounts.length-1);const nextAccount=customerServiceAccounts[customerServiceBoundAccount];customerServiceThread=nextAccount.threadIndexes[0];customerServiceMessageType='all';closeModal();render();openCustomerServiceAccountManager();toast(`${name}已删除`)}
  if(action==='new-library') modal('新建知识库','<div class="field"><label>知识库名称</label><input placeholder="请输入名称"></div><div class="field"><label>知识库说明</label><textarea placeholder="简要描述知识库中的内容"></textarea></div>','创建','create-done');
  if(action==='upload-file') modal('上传文件','<div class="field"><label>选择文件</label><div style="border:1px dashed #aebed3;border-radius:12px;text-align:center;padding:32px;color:#8b96a6">'+icon('upload',28)+'<p>点击或拖拽文件到这里</p><small>支持 PDF、Word、PPT、Excel</small></div></div>','开始上传','upload-done');
  if(action==='new-source'||action==='edit-source') openDynamicSourceModal(action==='edit-source');
  if(action==='add-source-url'){const list=document.querySelector('#source-url-list');if(list){list.insertAdjacentHTML('beforeend',`<div class="source-url-row"><input type="url" placeholder="请输入信源 URL，例如：https://example.com"><button type="button" class="icon-btn source-url-remove" data-action="remove-source-url" aria-label="删除信源 URL">${icon('close',15)}</button></div>`);list.lastElementChild?.querySelector('input')?.focus()}}
  if(action==='remove-source-url') actionEl.closest('.source-url-row')?.remove();
  if(action==='recharge') modal('账户充值','<div class="recharge-options"><button class="recharge-option active"><strong>¥100</strong><small>到账 100 元</small></button><button class="recharge-option"><strong>¥500</strong><small>到账 500 元</small></button><button class="recharge-option"><strong>¥1000</strong><small>到账 1000 元</small></button></div><p style="font-size:12px;color:#9099a8;margin-top:18px">当前为交互原型，不会发起真实支付。</p>','确认充值','recharge-done');
  if(action==='add-member') openMemberModal();
  if(action==='manage-org') openOrgManager();
  if(action==='new-role') openRoleModal();
  if(action==='export-directory') toast('通讯录名单已导出（原型演示）');
  if(action==='close-modal') closeModal();
  if(action==='feedback-reset'){const content=document.querySelector('#feedback-content');const contact=document.querySelector('#feedback-contact');if(content)content.value='';if(contact)contact.value='';const count=document.querySelector('#feedback-count');if(count)count.textContent='0';document.querySelectorAll('[data-feedback-type]').forEach((item,index)=>item.classList.toggle('active',index===0));toast('反馈内容已清空')}
  if(action==='feedback-submit'){const content=document.querySelector('#feedback-content')?.value.trim();if(!content){toast('请先填写问题描述');return}modal('反馈提交成功','<div class="feedback-success">'+icon('check',28)+'<strong>感谢你的反馈</strong><p>我们已经收到你的意见，产品团队会认真查看并持续改进体验。</p><small>反馈编号：FB-20260905-0186</small></div>','知道了','close-modal')}
  if(action==='cs-send'){const input=document.querySelector('#cs-reply-input');const value=input?.value.trim();if(!value){toast('请输入回复内容');input?.focus();return}customerServiceThreads[customerServiceThread].messages.push({from:'agent',type:'text',time:'刚刚',content:value});customerServiceMessageType='all';render();toast('回复已发送（原型演示）')}
  if(action==='task-custom-submit'&&agentTaskWizard){const input=document.querySelector('#task-custom-requirement');const value=input?.value.trim();if(!value){toast('请输入定制化需求');input?.focus();return}agentTaskWizard.answers.push(value);renderAgentTaskWizard()}
  if(action==='task-wizard-back'&&agentTaskWizard){agentTaskWizard.answers.pop();renderAgentTaskWizard()}
  if(action==='market-task-done'&&agentTaskWizard){const index=agentTaskWizard.index;agentExecutionCounts[currentAccount][index]=(agentExecutionCounts[currentAccount][index]||0)+1;closeModal();render();toast('任务已开始执行（原型演示）')}
  if(action==='select-agent-cs-plan'){
    const planIndex=Number(actionEl.dataset.planIndex);
    const plan=customerServicePlans[planIndex];
    if(!plan)return;
    pendingCustomerServicePlanIndex=planIndex;
    document.querySelectorAll('.agent-cs-plan').forEach((item,index)=>item.classList.toggle('active',index===planIndex));
    const planName=document.querySelector('#agent-cs-plan-name');
    const planPrice=document.querySelector('#agent-cs-plan-price');
    const balanceStatus=document.querySelector('#agent-cs-balance-status');
    const confirm=document.querySelector('.modal-actions [data-action="subscribe-agent"]');
    if(planName)planName.textContent=`${plan.accounts} 个号`;
    if(planPrice)planPrice.textContent=`¥${plan.price}`;
    if(balanceStatus){const enough=accountBalances[currentAccount]>=plan.price;balanceStatus.textContent=enough?'余额充足':'余额不足';balanceStatus.classList.toggle('enough',enough);balanceStatus.classList.toggle('insufficient',!enough)}
    if(confirm)confirm.textContent=`余额支付 ¥${plan.price}`;
  }
  if(action==='subscribe-agent'){const index=pendingMarketAgentIndex;if(index===null)return;const agent=marketAgents[index];const price=agent.customerService?customerServicePlans[pendingCustomerServicePlanIndex].price:(agent.cluster?99:9.9);if(accountBalances[currentAccount]<price){toast('账户余额不足，请先充值');return}closeModal();openAgentRoleAccess(index,price)}
  if(action==='agent-role-done'){const index=pendingMarketAgentIndex;const price=pendingMarketAgentPrice;const roles=[...document.querySelectorAll('[data-agent-access-role]:checked')].map(item=>item.value);const error=document.querySelector('#agent-role-error');if(!roles.length){if(error)error.textContent='请至少选择一个可访问角色';return}if(index===null||price===null)return;if(accountBalances[currentAccount]<price){if(error)error.textContent='账户余额不足，请返回充值后重试';return}const name=marketAgents[index].name;accountBalances[currentAccount]=Number((accountBalances[currentAccount]-price).toFixed(2));agentAccessibleRoles[currentAccount][index]=roles;agentHireTimes[currentAccount][index]='2026年9月9日';if(marketAgents[index].customerService)agentSubscriptionPlans[currentAccount][index]={...customerServicePlans[pendingCustomerServicePlanIndex]};hiredMarketAgents[currentAccount].add(index);pendingMarketAgentIndex=null;pendingMarketAgentPrice=null;closeModal();render();toast(`${name}已加入智能体团队`)}
  if(action==='agent-role-update'){const index=pendingMarketAgentIndex;const roles=[...document.querySelectorAll('[data-agent-access-role]:checked')].map(item=>item.value);const error=document.querySelector('#agent-role-error');if(!roles.length){if(error)error.textContent='请至少选择一个可访问角色';return}if(index===null||!hiredMarketAgents[currentAccount].has(index))return;const name=marketAgents[index].name;agentAccessibleRoles[currentAccount][index]=roles;pendingMarketAgentIndex=null;closeModal();render();toast(`${name}的访问角色已更新`)}
  if(action==='dismiss-agent'){const index=pendingMarketAgentIndex;if(index===null||!hiredMarketAgents[currentAccount].has(index))return;const name=marketAgents[index].name;hiredMarketAgents[currentAccount].delete(index);delete agentAccessibleRoles[currentAccount][index];delete agentHireTimes[currentAccount][index];delete agentSubscriptionPlans[currentAccount][index];pendingMarketAgentIndex=null;closeModal();render();toast(`${name}已解雇`)}
  if(action==='detail-agent-action'){const index=pendingMarketAgentIndex;if(index===null)return;closeModal();hiredMarketAgents[currentAccount].has(index)?openAgentTask(index):openAgentSubscription(index)}
  if(action==='member-done'){const name=document.querySelector('#new-member-name')?.value.trim();const phone=document.querySelector('#new-member-phone')?.value.trim();const dept=document.querySelector('#new-member-dept')?.value;const permission=document.querySelector('#new-member-role')?.value;const error=document.querySelector('#member-form-error');if(!name||!phone||!dept||!permission){if(error)error.textContent='请填写所有必选项';return}const values={name,role:editingMemberIndex===null?permission:(directoryMembers[editingMemberIndex].role||permission),permission,dept,phone,email:document.querySelector('#new-member-email')?.value.trim()||'—',active:editingMemberIndex===null?true:directoryMembers[editingMemberIndex].active,color:editingMemberIndex===null?'#4f92e8':directoryMembers[editingMemberIndex].color};if(editingMemberIndex===null)directoryMembers.push(values);else directoryMembers[editingMemberIndex]=values;const updated=editingMemberIndex!==null;editingMemberIndex=null;closeModal();render();toast(updated?'成员信息修改成功':'企业成员添加成功')}
  if(action==='org-done'){closeModal();render();toast('组织架构已更新')}
  if(action==='create-department'){const input=document.querySelector('#new-department-name');const name=input?.value.trim();const parent=document.querySelector('#new-department-parent')?.value||'幻馨智能科技';const error=document.querySelector('#department-error');if(!name){if(error)error.textContent='请输入部门名称';return}if(directoryDepartments.some(d=>d[0]===name)){if(error)error.textContent='该部门已经存在';return}directoryDepartments.push([name,0,parent]);renderOrgDepartmentList();input.value='';if(error)error.textContent='';toast('部门创建成功')}
  if(action==='org-edit'){const index=Number(actionEl.dataset.index);const row=document.querySelector(`[data-org-index="${index}"]`);const name=directoryDepartments[index][0];row.querySelector('.org-department-copy').innerHTML=`<input class="org-inline-input" value="${name}" aria-label="编辑部门名称"><span class="org-inline-error"></span>`;row.querySelector('.org-department-actions').innerHTML=`<button class="btn primary" data-action="org-save" data-index="${index}">保存</button><button class="btn" data-action="org-cancel">取消</button>`;row.querySelector('.org-inline-input')?.focus()}
  if(action==='org-cancel') renderOrgDepartmentList();
  if(action==='org-save'){const index=Number(actionEl.dataset.index);const row=document.querySelector(`[data-org-index="${index}"]`);const input=row?.querySelector('.org-inline-input');const next=input?.value.trim();const old=directoryDepartments[index][0];const error=row?.querySelector('.org-inline-error');if(!next){if(error)error.textContent='名称不能为空';return}if(directoryDepartments.some((d,i)=>i!==index&&d[0]===next)){if(error)error.textContent='名称已存在';return}directoryDepartments[index][0]=next;directoryDepartments.forEach(d=>{if(d[2]===old)d[2]=next});directoryMembers.forEach(m=>{if(m.dept===old)m.dept=next});if(directoryDept===old)directoryDept=next;renderOrgDepartmentList();toast('部门名称修改成功')}
  if(action==='org-delete'){const index=Number(actionEl.dataset.index);const name=directoryDepartments[index][0];const count=departmentMemberCount(name);const hasChildren=directoryDepartments.some(d=>d[2]===name);if(count>0||hasChildren){toast('该部门有关联成员或下级部门，暂不能删除');return}directoryDepartments.splice(index,1);renderOrgDepartmentList();toast('部门已删除')}
  if(action==='role-done'){const name=document.querySelector('#role-name')?.value.trim();const error=document.querySelector('#role-form-error');if(!name){if(error)error.textContent='请填写角色名称';return}if(roleRecords.some((r,i)=>i!==editingRoleIndex&&r.name===name)){if(error)error.textContent='角色名称已存在';return}const modules=[...document.querySelectorAll('[data-role-module]:checked')].map(x=>x.value);const dataScope=document.querySelector('input[name="data-scope"]:checked')?.value||'本人';const values={name,description:document.querySelector('#role-description')?.value.trim()||'',modules,dataScope,active:editingRoleIndex===null?true:roleRecords[editingRoleIndex].active};const updated=editingRoleIndex!==null;if(updated)roleRecords[editingRoleIndex]=values;else roleRecords.push(values);editingRoleIndex=null;closeModal();render();toast(updated?'角色修改成功':'角色创建成功')}
  if(['create-done','upload-done','source-done','recharge-done'].includes(action)){closeModal();toast({ 'create-done':'知识库创建成功','upload-done':'文件已加入上传队列','source-done':'动态文件已保存','recharge-done':'原型演示：充值成功'}[action])}
  if(action==='clear-selection'){selectedFiles.clear();document.querySelectorAll('.row-check').forEach(x=>x.checked=false);updateCount()}
  if(action==='select-all'){document.querySelectorAll('.row-check').forEach((x,i)=>{x.checked=actionEl.checked;x.checked?selectedFiles.add(i):selectedFiles.delete(i)});updateCount()}
  if(action==='reset-search'){const i=document.querySelector('#file-search');if(i){i.value='';filterRows('')}}
  if(action==='toggle-agents') document.querySelector('#agent-menu')?.classList.toggle('hidden');
  if(action==='send-chat'){const val=document.querySelector('#chat-input')?.value.trim();if(!val){toast('请输入想咨询的问题');return}sessionStorage.setItem(`lastQuestion-${currentAccount}`,val);navigate('/chat-result')}
  if(action==='get-code'){let n=60;actionEl.disabled=true;actionEl.textContent=`${n}s 后重试`;const timer=setInterval(()=>{n--;actionEl.textContent=`${n}s 后重试`;if(n<=0){clearInterval(timer);actionEl.disabled=false;actionEl.textContent='获取验证码'}},1000)}
  if(action==='login'){if(!document.querySelector('#agree')?.checked){toast('请先同意用户协议和隐私政策');return}navigate('/home');toast('登录成功')}
  if(action==='register'){if(!document.querySelector('#agree')?.checked){toast('请先同意用户协议和隐私政策');return}navigate('/home')}
  if(action==='back-login') history.length>1?history.back():navigate('/login');
  const agentEl=e.target.closest('[data-agent]');if(agentEl){currentAgent=Number(agentEl.dataset.agent);render()}
  const sw=e.target.closest('[data-switch]');if(sw){sw.classList.toggle('on');switches.set(sw.dataset.switch,sw.classList.contains('on'));toast(sw.classList.contains('on')?'资料已启用':'资料已禁用')}
  const rech=e.target.closest('.recharge-option');if(rech){document.querySelectorAll('.recharge-option').forEach(x=>x.classList.remove('active'));rech.classList.add('active')}
  const auth=e.target.closest('[data-auth]');if(auth){document.querySelectorAll('.auth-tab').forEach(x=>x.classList.toggle('active',x===auth));document.querySelector('#auth-form').innerHTML=auth.dataset.auth==='login'?loginForm():registerForm()}
  const balanceTab=e.target.closest('[data-balance-tab]');if(balanceTab){document.querySelectorAll('[data-balance-tab]').forEach(x=>x.classList.toggle('active',x===balanceTab));document.querySelector('#balance-table').innerHTML=balanceTab.dataset.balanceTab==='consume'?consumeTable():rechargeTable()}
  const feedbackType=e.target.closest('[data-feedback-type]');if(feedbackType){document.querySelectorAll('[data-feedback-type]').forEach(x=>x.classList.toggle('active',x===feedbackType))}
  const customerThreadEl=e.target.closest('[data-cs-thread]');if(customerThreadEl){customerServiceThread=Number(customerThreadEl.dataset.csThread);customerServiceMessageType='all';render()}
  const customerModeEl=e.target.closest('[data-cs-mode]');if(customerModeEl){customerServiceMode=customerModeEl.dataset.csMode;customerServiceThread=customerServiceAccounts[customerServiceBoundAccount].threadIndexes[0];render()}
  const customerTypeEl=e.target.closest('[data-cs-message-type]');if(customerTypeEl){customerServiceMessageType=customerTypeEl.dataset.csMessageType;render()}
  const customerAccountEl=e.target.closest('[data-cs-account]');if(customerAccountEl){customerServiceBoundAccount=Number(customerAccountEl.dataset.csAccount);customerServiceThread=customerServiceAccounts[customerServiceBoundAccount].threadIndexes[0];customerServiceMessageType='all';render();toast(`已切换至${customerServiceAccounts[customerServiceBoundAccount].name}`)}
  const helpCategoryEl=e.target.closest('[data-help-category]');if(helpCategoryEl){helpCurrentCategory=helpCategoryEl.dataset.helpCategory;helpCurrentArticle=0;render()}
  const helpArticleEl=e.target.closest('[data-help-article]');if(helpArticleEl){helpCurrentArticle=Number(helpArticleEl.dataset.helpArticle);render()}
  const deptEl=e.target.closest('[data-directory-dept]');if(deptEl){directoryDept=deptEl.dataset.directoryDept;renderDirectoryMembers()}
  const memberMenu=e.target.closest('[data-member-menu]');if(memberMenu){document.querySelector('.member-menu-floating')?.remove();const index=Number(memberMenu.dataset.memberMenu);const member=directoryMembers[index];const rect=memberMenu.getBoundingClientRect();document.body.insertAdjacentHTML('beforeend',`<div class="member-actions-menu member-menu-floating" style="top:${rect.bottom+4}px;left:${Math.max(8,rect.right-116)}px"><button data-member-action="disable" data-index="${index}" ${member.active?'':'disabled'}>停用</button><button data-member-action="enable" data-index="${index}" ${member.active?'disabled':''}>启用</button><button data-member-action="edit" data-index="${index}">修改</button></div>`)}
  const memberAction=e.target.closest('[data-member-action]');if(memberAction&&!memberAction.disabled){const index=Number(memberAction.dataset.index);document.querySelector('.member-menu-floating')?.remove();if(memberAction.dataset.memberAction==='edit')openMemberModal(index);else{directoryMembers[index].active=memberAction.dataset.memberAction==='enable';renderDirectoryMembers();toast(directoryMembers[index].active?'成员已启用':'成员已停用')}}
  const roleToggle=e.target.closest('[data-role-toggle]');if(roleToggle){const index=Number(roleToggle.dataset.roleToggle);roleRecords[index].active=!roleRecords[index].active;renderRoles();toast(roleRecords[index].active?'角色已启用':'角色已停用')}
  const roleEdit=e.target.closest('[data-role-edit]');if(roleEdit)openRoleModal(Number(roleEdit.dataset.roleEdit));
  const roleDelete=e.target.closest('[data-role-delete]');if(roleDelete){roleRecords.splice(Number(roleDelete.dataset.roleDelete),1);renderRoles();toast('角色已删除')}
  const recentItem=e.target.closest('[data-recent-index]');if(recentItem){const index=Number(recentItem.dataset.recentIndex);const item=recentItems[currentAccount][index];selectedRecentIndexes[currentAccount]=index;if(item.type==='conversation'){sessionStorage.setItem(`lastQuestion-${currentAccount}`,item.title);navigate('/chat-result')}else navigate(item.detailStyle==='light'?'/task-detail-backup':'/task-detail')}
  const runningTaskItem=e.target.closest('[data-running-task-index]');if(runningTaskItem){const index=Number(runningTaskItem.dataset.runningTaskIndex);const item=recentItems[currentAccount][index];selectedRecentIndexes[currentAccount]=index;document.querySelector('#running-task-panel')?.classList.add('hidden');navigate(item.detailStyle==='light'?'/task-detail-backup':'/task-detail')}
  const marketCategoryEl=e.target.closest('[data-market-category]');if(marketCategoryEl){marketCategory=marketCategoryEl.dataset.marketCategory;render()}
  const taskChoice=e.target.closest('[data-task-choice]');if(taskChoice&&agentTaskWizard){const agent=marketAgents[agentTaskWizard.index];const steps=agentTaskSteps(agent);const step=agentTaskWizard.answers.length;const choice=steps[step]?.options[Number(taskChoice.dataset.taskChoice)];if(choice){agentTaskWizard.answers.push(choice);renderAgentTaskWizard()}}
  const agentCardMenuTrigger=e.target.closest('[data-agent-card-menu]');if(agentCardMenuTrigger){document.querySelector('.agent-card-menu-floating')?.remove();const index=Number(agentCardMenuTrigger.dataset.agentCardMenu);const rect=agentCardMenuTrigger.getBoundingClientRect();document.body.insertAdjacentHTML('beforeend',`<div class="agent-card-menu-floating" style="top:${rect.bottom+5}px;left:${Math.max(8,rect.right-126)}px"><button data-agent-card-menu-action="edit" data-agent-index="${index}">${icon('key',15)}<span>修改</span></button><button class="danger" data-agent-card-menu-action="dismiss" data-agent-index="${index}">${icon('close',15)}<span>解雇</span></button></div>`)}
  const agentCardMenuAction=e.target.closest('[data-agent-card-menu-action]');if(agentCardMenuAction){const index=Number(agentCardMenuAction.dataset.agentIndex);document.querySelector('.agent-card-menu-floating')?.remove();if(agentCardMenuAction.dataset.agentCardMenuAction==='edit')openAgentRoleEditor(index);else openAgentDismissal(index)}
  const marketAgentAction=e.target.closest('[data-market-agent-action]');if(marketAgentAction){const index=Number(marketAgentAction.dataset.agentIndex);const action=marketAgentAction.dataset.marketAgentAction;if(action==='hire')openAgentSubscription(index);else if(action==='dismiss')openAgentDismissal(index);else openAgentTask(index)}
  const marketAgentCard=e.target.closest('[data-market-agent-card]');if(marketAgentCard&&!marketAgentAction&&!agentCardMenuTrigger&&!agentCardMenuAction)openAgentDetail(Number(marketAgentCard.dataset.marketAgentCard));
  const accountOption=e.target.closest('[data-account]');if(accountOption){currentAccount=accountOption.dataset.account;location.hash='/home';render();toast(currentAccount==='personal'?'已切换至个人版':'已切换至望湘园企业版')}
  if(!e.target.closest('.user-popover,.user-menu-trigger')) document.querySelector('#user-popover')?.classList.add('hidden');
  if(!e.target.closest('.account-switcher,.account-current')) document.querySelector('#account-switcher')?.classList.add('hidden');
  if(!e.target.closest('.member-actions-menu,[data-member-menu]')) document.querySelector('.member-menu-floating')?.remove();
  if(!e.target.closest('.agent-card-menu-floating,[data-agent-card-menu]')) document.querySelector('.agent-card-menu-floating')?.remove();
  if(!e.target.closest('.running-task-dock')){document.querySelector('#running-task-panel')?.classList.add('hidden');document.querySelector('#running-task-dock')?.classList.remove('expanded')}
});

document.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-running-task-drag]');if(!handle||e.target.closest('.running-task-panel .icon-btn'))return;const dock=document.querySelector('#running-task-dock');if(!dock)return;const rect=dock.getBoundingClientRect();runningDockDrag={dock,startX:e.clientX,startY:e.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height,moved:false};dock.style.left=`${rect.left}px`;dock.style.top=`${rect.top}px`;dock.style.right='auto';dock.style.bottom='auto';dock.classList.add('dragging')})
document.addEventListener('pointermove',e=>{if(!runningDockDrag)return;const dx=e.clientX-runningDockDrag.startX;const dy=e.clientY-runningDockDrag.startY;if(Math.abs(dx)+Math.abs(dy)>5)runningDockDrag.moved=true;const left=Math.min(Math.max(8,runningDockDrag.left+dx),Math.max(8,window.innerWidth-runningDockDrag.width-8));const top=Math.min(Math.max(8,runningDockDrag.top+dy),Math.max(8,window.innerHeight-runningDockDrag.height-8));runningDockDrag.dock.style.left=`${left}px`;runningDockDrag.dock.style.top=`${top}px`;runningTaskDockPosition={left:Math.round(left),top:Math.round(top)};if(runningDockDrag.moved)e.preventDefault()})
document.addEventListener('pointerup',()=>{if(!runningDockDrag)return;const moved=runningDockDrag.moved;runningDockDrag.dock.classList.remove('dragging');runningDockDrag=null;if(moved){suppressRunningDockClick=true;setTimeout(()=>{suppressRunningDockClick=false},0)}})

document.addEventListener('change',e=>{if(e.target.matches('.row-check')){const i=Number(e.target.dataset.index);e.target.checked?selectedFiles.add(i):selectedFiles.delete(i);updateCount()}})
document.addEventListener('input',e=>{if(e.target.id==='library-search'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.library-card[data-name]').forEach(x=>x.style.display=x.dataset.name.toLowerCase().includes(q)?'':'none')}if(e.target.id==='file-search')filterRows(e.target.value.trim().toLowerCase());if(e.target.id==='directory-search')renderDirectoryMembers();if(e.target.id==='role-search')renderRoles();if(e.target.id==='feedback-content'){const count=document.querySelector('#feedback-count');if(count)count.textContent=e.target.value.length}if(e.target.id==='help-global-search'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.help-tree-article').forEach(x=>x.style.display=x.dataset.search.toLowerCase().includes(q)?'':'none')}if(e.target.id==='cs-thread-search'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.cs-thread').forEach(x=>x.style.display=x.dataset.search.toLowerCase().includes(q)?'':'none')}if(e.target.id==='cs-message-search'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.cs-message-item').forEach(x=>x.style.display=x.dataset.messageSearch.toLowerCase().includes(q)?'':'none')}})
document.addEventListener('change',e=>{if(e.target.id==='directory-status')renderDirectoryMembers();if(e.target.id==='role-status')renderRoles();if(e.target.matches('.cs-kb-option input'))updateCustomerServiceKnowledgeCount();if(e.target.id==='cs-bind-province'){const hasProvince=Boolean(e.target.value);const placeholder=document.querySelector('.cs-bind-qr-placeholder');const qr=document.querySelector('.cs-bind-qr');const scan=document.querySelector('.cs-bind-scan');const confirm=document.querySelector('[data-action="cs-bind-done"]');placeholder?.classList.toggle('hidden',hasProvince);qr?.classList.toggle('hidden',!hasProvince);scan?.classList.toggle('waiting',!hasProvince);if(confirm)confirm.disabled=!hasProvince;if(hasProvince){qr?.classList.remove('refreshed');void qr?.offsetWidth;qr?.classList.add('refreshed')}}})
document.addEventListener('keydown',e=>{if(e.target.id==='task-custom-requirement'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-action="task-custom-submit"]')?.click();return}if(e.target.id==='cs-reply-input'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();document.querySelector('[data-action="cs-send"]')?.click();return}if(e.key==='Escape'){document.querySelector('.about-backdrop')?.remove();closeModal();document.querySelector('#user-popover')?.classList.add('hidden');document.querySelector('#running-task-panel')?.classList.add('hidden');document.querySelector('#running-task-dock')?.classList.remove('expanded')}})
function filterRows(q){document.querySelectorAll('[data-file-row]').forEach(x=>x.style.display=x.dataset.name.toLowerCase().includes(q)?'':'none')}
function updateCount(){const el=document.querySelector('#selected-count');if(el)el.textContent=selectedFiles.size}

window.addEventListener('hashchange',render);
if(!location.hash) location.hash='/login'; else render();
