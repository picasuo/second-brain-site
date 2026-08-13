export type TableOfContentsItem = { depth: 2 | 3; id: string; text: string };

export type PublishedNote = { title: string; date: string; filename: string; tags: string[]; noteUrl: string; renderedContent: string; tableOfContents: TableOfContentsItem[] };

export const publishedNotes: PublishedNote[] = [
  {
    "noteUrl": "/notes/oracle-server-setup/",
    "date": "2026-06-01",
    "filename": "Oracle 服务器开机 SOP.md",
    "renderedContent": "<h1 id=\"oracle-服务器开机-sop\">Oracle 服务器开机 SOP</h1>\n<p>本文档是新 Oracle Cloud 免费实例的<strong>标准初始化流程</strong>，每一步都链接到对应的详细文档。</p>\n<hr>\n<section class=\"doc-section\" data-section-number=\"01\">\n<h2 id=\"流程概览\">流程概览</h2>\n<pre><code>重装系统（可选）\n    ↓\nSwap + zRAM 配置\n    ↓\nDocker 安装\n    ↓\n安全加固（按场景二选一）\n  ├─ 单台个人服务器 → 个人服务器安全加固方案\n  └─ 多台服务器集群 → Oracle 多机集群零公网架构方案\n    ↓\n对外服务发布（Cloudflare Tunnel）\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"02\">\n<h2 id=\"重装系统可选推荐-debian-12\">重装系统（可选，推荐 Debian 12）</h2>\n<p>使用 <a href=\"https://github.com/bin456789/reinstall\">dd重装脚本</a> 将系统重装为 Debian 12（轻量系统对低配内存的机器更友好）。</p>\n<h3 id=\"操作步骤\">操作步骤</h3>\n<ol>\n<li>复制机器现在的 SSH 登录公钥</li>\n<li>参照仓库 readme 安装脚本</li>\n<li>执行重装脚本，使用 <code>--ssh-key</code> 携带公钥：</li>\n</ol>\n<pre><code class=\"language-bash\">bash reinstall.sh --ssh-key &quot;ssh-rsa ...&quot;\n</code></pre>\n<ol start=\"4\">\n<li>\n<p>脚本下载镜像完成会提示 <code>reboot</code> 重启服务器，使用 <code>root</code> 登录</p>\n<p><img src=\"/%E8%BF%90%E7%BB%B4/assets/Oracle%20%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%BC%80%E6%9C%BA%20SOP/file-20260321180609466.png\" alt=\"\"></p>\n</li>\n<li>\n<p>执行 <code>reboot</code>，SSH 会话断开，将 SSH 客户端用户名改为 <code>root</code>，私钥文件不变，重新连接。看到下图报错是正常现象，选择替换即可。（如果替换后连接失败，就再等几分钟。）</p>\n<p><img src=\"/%E8%BF%90%E7%BB%B4/assets/Oracle%20%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%BC%80%E6%9C%BA%20SOP/file-20260321181116406.png\" alt=\"\"></p>\n</li>\n<li>\n<p>成功登录后会看到新系统正在 Reinstalling，等待即可。</p>\n<p><img src=\"/%E8%BF%90%E7%BB%B4/assets/Oracle%20%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%BC%80%E6%9C%BA%20SOP/file-20260321181515239.png\" alt=\"\"></p>\n</li>\n</ol>\n<blockquote>\n<p>安装完成后，参考以下各步骤继续配置。</p>\n</blockquote>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"03\">\n<h2 id=\"swap--zram-配置\">Swap + zRAM 配置</h2>\n<blockquote>\n<p>详细步骤参见 <span>Swap + zRAM 完整配置</span></p>\n</blockquote>\n<p>Oracle Cloud 1C1G 机型<strong>必须</strong>配置 zRAM + Swap，否则 Docker 极易 OOM。</p>\n<p><strong>推荐配置：</strong></p>\n<pre><code>zRAM：512MB（lz4）\nSwap：1GB\nswappiness：70\nvfs_cache_pressure：150\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"04\">\n<h2 id=\"安装-docker\">安装 Docker</h2>\n<blockquote>\n<p>参考 <a href=\"https://docs.docker.com/engine/install/debian/\">官方 Debian 安装文档</a></p>\n</blockquote>\n<pre><code class=\"language-bash\">sudo apt update\nsudo apt install ca-certificates curl gnupg\nsudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg\nsudo chmod a+r /etc/apt/keyrings/docker.gpg\necho &quot;deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release &amp;&amp; echo &quot;$VERSION_CODENAME&quot;) stable&quot; | sudo tee /etc/apt/sources.list.d/docker.list &gt; /dev/null\nsudo apt update\nsudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"05\">\n<h2 id=\"安全加固按场景选择方案\">安全加固（按场景选择方案）</h2>\n<p><strong>核心目标</strong>：关闭所有公网入站端口，使用 Tailscale 私网访问，实现零公网暴露。</p>\n<blockquote>\n<p>以下两个方案的<strong>公共步骤相同</strong>（安装 Tailscale → 关安全组 → 配防火墙），区别在于 SSH 认证策略和架构深度。\n根据你的场景<strong>二选一</strong>即可：</p>\n</blockquote>\n<h3 id=\"方案-a单台个人服务器--个人服务器安全加固方案\">方案 A：单台个人服务器 → <a href=\"/notes/personal-server-security-hardening-solution/\">个人服务器安全加固方案</a></h3>\n<p><strong>适用场景</strong>：个人项目、单人维护，只有 1~2 台机器。</p>\n<ul>\n<li>Root + 密钥直连（<code>PermitRootLogin prohibit-password</code>）</li>\n<li>Tailscale 组网 + UFW + Oracle 安全组</li>\n<li>含三重兜底机制（Tailscale → 临时公网 SSH → Serial Console）</li>\n</ul>\n<h3 id=\"方案-b多台服务器集群--oracle-多机集群零公网架构方案\">方案 B：多台服务器集群 → <a href=\"/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/\">Oracle 多机集群零公网架构方案</a></h3>\n<p><strong>适用场景</strong>：多台服务器集群（如 ARM + 2 AMD 架构）、团队协作维护。</p>\n<ul>\n<li>在方案 A 基础上增加：\n<ul>\n<li>多节点 Tunnel 入口容灾</li>\n<li>跨服务器 Tailscale 内网互通</li>\n<li>健康检查 + 保活策略（防 Oracle 回收）</li>\n</ul>\n</li>\n</ul>\n<h3 id=\"公共步骤速查\">公共步骤速查</h3>\n<ol>\n<li><strong>安装 Tailscale</strong>：<code>curl -fsSL https://tailscale.com/install.sh | sh</code></li>\n<li><strong>启动并加入网络</strong>：<code>tailscale up</code></li>\n<li><strong>获取内网 IP</strong>：<code>tailscale ip -4</code>（记下 <code>100.x.x.x</code>）</li>\n<li><strong>配置云平台安全组</strong>（详见所选方案文档中的具体步骤）</li>\n<li><strong>设置 Disable Key Expiry</strong>（防止凭证过期失联）</li>\n<li><strong>UFW 防火墙配置</strong>：<pre><code class=\"language-bash\">sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow in on tailscale0\nsudo ufw enable\n</code></pre>\n</li>\n</ol>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"06\">\n<h2 id=\"对外服务发布cloudflare-tunnel\">对外服务发布（Cloudflare Tunnel）</h2>\n<blockquote>\n<p>详细步骤参见 <a href=\"/notes/cloudflare-tunnel-solution/\">Cloudflare Tunnel 完整方案</a></p>\n</blockquote>\n<p><strong>核心目标</strong>：让 Web 服务对外可访问，同时不开放任何公网端口。</p>\n<ol>\n<li>安装 cloudflared</li>\n<li>创建 Tunnel：<code>cloudflared tunnel create homelab</code></li>\n<li>配置 ingress 规则</li>\n<li>设置开机自启</li>\n</ol>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"07\">\n<h2 id=\"完成后验证清单\">完成后验证清单</h2>\n<ul>\n<li>[ ] SSH 通过 Tailscale IP (<code>100.x.x.x</code>) 可正常登录</li>\n<li>[ ] 公网 IP 无法 SSH（安全组已关闭）</li>\n<li>[ ] <code>free -h</code> 显示 zRAM + Swap 已启用</li>\n<li>[ ] <code>docker --version</code> 正常</li>\n<li>[ ] Cloudflare Tunnel 状态正常</li>\n</ul>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"08\">\n<h2 id=\"附录创建管理用户可选\">附录：创建管理用户（可选）</h2>\n<blockquote>\n<p><strong>个人服务器</strong>（单人维护）：可跳过，直接用 Root + 密钥登录即可。\n<strong>企业/多人维护服务器</strong>：<strong>强烈建议</strong>执行，避免所有人共享 Root 最高权限。</p>\n</blockquote>\n<p><strong>核心目标</strong>：创建独立管理用户，日常使用该用户操作服务器，通过 <code>sudo</code> 提权执行特权命令。</p>\n<ol>\n<li><strong>创建新用户</strong>：<code>adduser yourname</code></li>\n<li><strong>赋予 sudo 权限</strong>：<code>apt update &amp;&amp; apt install sudo -y &amp;&amp; usermod -aG sudo yourname</code></li>\n<li><strong>测试新用户</strong>：<strong>不要关掉当前的 Root 窗口</strong>，另开一个 SSH 窗口尝试用新用户登录</li>\n<li><strong>禁用 Root 登录</strong>：\n<ul>\n<li>编辑配置：<code>nano /etc/ssh/sshd_config</code></li>\n<li>修改：<code>PermitRootLogin no</code></li>\n<li>重启：<code>systemctl restart ssh</code></li>\n</ul>\n</li>\n</ol>\n</section>\n",
    "tableOfContents": [
      {
        "depth": 2,
        "id": "流程概览",
        "text": "流程概览"
      },
      {
        "depth": 2,
        "id": "重装系统可选推荐-debian-12",
        "text": "重装系统（可选，推荐 Debian 12）"
      },
      {
        "depth": 3,
        "id": "操作步骤",
        "text": "操作步骤"
      },
      {
        "depth": 2,
        "id": "swap--zram-配置",
        "text": "Swap + zRAM 配置"
      },
      {
        "depth": 2,
        "id": "安装-docker",
        "text": "安装 Docker"
      },
      {
        "depth": 2,
        "id": "安全加固按场景选择方案",
        "text": "安全加固（按场景选择方案）"
      },
      {
        "depth": 3,
        "id": "方案-a单台个人服务器--个人服务器安全加固方案",
        "text": "方案 A：单台个人服务器 → 个人服务器安全加固方案"
      },
      {
        "depth": 3,
        "id": "方案-b多台服务器集群--oracle-多机集群零公网架构方案",
        "text": "方案 B：多台服务器集群 → Oracle 多机集群零公网架构方案"
      },
      {
        "depth": 3,
        "id": "公共步骤速查",
        "text": "公共步骤速查"
      },
      {
        "depth": 2,
        "id": "对外服务发布cloudflare-tunnel",
        "text": "对外服务发布（Cloudflare Tunnel）"
      },
      {
        "depth": 2,
        "id": "完成后验证清单",
        "text": "完成后验证清单"
      },
      {
        "depth": 2,
        "id": "附录创建管理用户可选",
        "text": "附录：创建管理用户（可选）"
      }
    ],
    "tags": [
      "运维",
      "oracle",
      "sop",
      "开机",
      "debian"
    ],
    "title": "Oracle 服务器开机 SOP"
  },
  {
    "noteUrl": "/notes/cloudflare-tunnel-solution/",
    "date": "2026-04-01",
    "filename": "Cloudflare Tunnel 完整方案.md",
    "renderedContent": "<h1 id=\"cloudflare-tunnel-完整方案\">Cloudflare Tunnel 完整方案</h1>\n<p>本文涵盖两种 tunnel 管理方式：<strong>Dashboard 远程管理</strong>（推荐）和<strong>本地文件管理</strong>。两种方式功能等价，区别仅在于配置的存储和维护位置。</p>\n<blockquote>\n<p>相关文档：</p>\n<ul>\n<li>多入口容灾架构参见 <a href=\"/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/\">Oracle 多机集群零公网架构方案</a></li>\n<li>Tunnel 与 Tailscale 配合使用参见 <a href=\"/notes/n-8fdfccf8-31b5-463b-8822-d7377cf8f6d7/\">Tailscale 零公网暴露方案</a></li>\n</ul>\n</blockquote>\n<hr>\n<section class=\"doc-section\" data-section-number=\"01\">\n<h2 id=\"两种方式对比\">两种方式对比</h2>\n<table>\n<thead>\n<tr>\n<th></th>\n<th>Dashboard 管理（推荐）</th>\n<th>本地管理</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>配置存储位置</td>\n<td>Cloudflare 云端</td>\n<td>服务器本地 <code>config.yml</code></td>\n</tr>\n<tr>\n<td>增删路由规则</td>\n<td>Dashboard 网页操作，实时生效</td>\n<td>修改 <code>config.yml</code>，需重启服务</td>\n</tr>\n<tr>\n<td>服务器上的文件</td>\n<td>仅 systemd service 文件</td>\n<td>config.yml + credentials 文件</td>\n</tr>\n<tr>\n<td>多机器管理</td>\n<td>任意设备登录 Dashboard 即可</td>\n<td>需 SSH 进服务器操作</td>\n</tr>\n<tr>\n<td>适合场景</td>\n<td>绝大多数场景</td>\n<td>需要版本控制（GitOps）/离线环境</td>\n</tr>\n</tbody>\n</table>\n<blockquote>\n<p><strong>推荐使用 Dashboard 方式</strong>。本地管理方式在需要通过 Git 管理配置、或服务器无法访问 Cloudflare 控制平面等特殊场景下仍有其价值。</p>\n</blockquote>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"02\">\n<h2 id=\"前置条件\">前置条件</h2>\n<table>\n<thead>\n<tr>\n<th>要求</th>\n<th>说明</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Cloudflare 账户</td>\n<td>已登录 <a href=\"https://dash.cloudflare.com\">dash.cloudflare.com</a></td>\n</tr>\n<tr>\n<td>域名托管</td>\n<td>域名已添加到 Cloudflare（NS 已切换）</td>\n</tr>\n<tr>\n<td>服务器</td>\n<td>Linux 服务器，能访问外网（无需开放入站端口）</td>\n</tr>\n<tr>\n<td>cloudflared</td>\n<td>已安装（或按下文步骤安装）</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"03\">\n<h2 id=\"第一步清理旧环境如有\">第一步：清理旧环境（如有）</h2>\n<p>如果之前运行过 cloudflared，先彻底清理再重新配置：</p>\n<pre><code class=\"language-bash\"># 停止并卸载旧 systemd 服务\nsudo systemctl stop cloudflared\nsudo cloudflared service uninstall\n\n# 删除本地配置文件\nsudo rm -rf /etc/cloudflared/\nrm -rf ~/.cloudflared/\n</code></pre>\n<p>然后进入 <strong>Cloudflare Zero Trust → Networks → Tunnels</strong>，手动删除 Dashboard 中的旧 tunnel 条目。</p>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"04\">\n<h2 id=\"第二步安装-cloudflared\">第二步：安装 cloudflared</h2>\n<h3 id=\"debian--ubuntu\">Debian / Ubuntu</h3>\n<pre><code class=\"language-bash\"># 添加 Cloudflare APT 源\ncurl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \\\n  | sudo tee /usr/share/keyrings/cloudflare-main.gpg &gt; /dev/null\n\necho &quot;deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] \\\n  https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main&quot; \\\n  | sudo tee /etc/apt/sources.list.d/cloudflared.list\n\nsudo apt update &amp;&amp; sudo apt install cloudflared -y\n</code></pre>\n<h3 id=\"rhel--centos--rocky\">RHEL / CentOS / Rocky</h3>\n<pre><code class=\"language-bash\">curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \\\n  | sudo tee /usr/share/keyrings/cloudflare-main.gpg &gt; /dev/null\n\nsudo tee /etc/yum.repos.d/cloudflared.repo &lt;&lt;EOF\n[cloudflared]\nname=Cloudflare\nbaseurl=https://pkg.cloudflare.com/cloudflared/rpm/\nenabled=1\ngpgcheck=1\ngpgkey=https://pkg.cloudflare.com/cloudflare-main.gpg\nEOF\n\nsudo yum install cloudflared -y\n</code></pre>\n<h3 id=\"验证安装\">验证安装</h3>\n<pre><code class=\"language-bash\">cloudflared --version\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"05\">\n<h2 id=\"方式一dashboard-远程管理推荐\">方式一：Dashboard 远程管理（推荐）</h2>\n<h3 id=\"第三步在-dashboard-创建-tunnel\">第三步：在 Dashboard 创建 Tunnel</h3>\n<ol>\n<li>打开 <a href=\"https://one.dash.cloudflare.com\">Cloudflare Zero Trust</a></li>\n<li>左侧菜单进入 <strong>Networks → Connectors → Cloudflare Tunnels</strong></li>\n<li>点击右上角 <strong>+ Add a tunnel</strong></li>\n<li>Connector type 选择 <strong>Cloudflared</strong>，点击 <strong>Next</strong></li>\n<li>填写 <strong>Tunnel name</strong>（例如 <code>my-server</code>），点击 <strong>Save tunnel</strong></li>\n</ol>\n<p>页面会显示安装命令，其中包含你的 tunnel token（<code>eyJ...</code> 开头的长字符串）。</p>\n<blockquote>\n<p>⚠️ <strong>不要直接运行 Dashboard 给出的完整安装命令</strong>，它会重新下载 cloudflared。你已经安装好了，只需要复制 token，按下一步操作。</p>\n</blockquote>\n<h3 id=\"第四步注册为-systemd-服务\">第四步：注册为 systemd 服务</h3>\n<pre><code class=\"language-bash\"># 将 &lt;TOKEN&gt; 替换为你从 Dashboard 复制的完整 token\nsudo cloudflared service install --token &lt;TOKEN&gt;\n\n# 启动并设置开机自启\nsudo systemctl start cloudflared\nsudo systemctl enable cloudflared\nsudo systemctl status cloudflared\n</code></pre>\n<p>状态显示 <code>active (running)</code> 即成功。此时 Dashboard 上 Tunnel 状态应变为 <strong>Healthy</strong>。</p>\n<p>service 文件内容示例（自动生成，无需手动编写）：</p>\n<pre><code class=\"language-ini\">[Service]\nExecStart=/usr/local/bin/cloudflared tunnel run --token eyJ...\n</code></pre>\n<h3 id=\"第五步在-dashboard-配置路由规则\">第五步：在 Dashboard 配置路由规则</h3>\n<p>回到 Dashboard，在 Tunnel 详情页选择 <strong>Public Hostname</strong> 标签 → <strong>Add a public hostname</strong>：</p>\n<table>\n<thead>\n<tr>\n<th>字段</th>\n<th>说明</th>\n<th>示例</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Subdomain</td>\n<td>子域名</td>\n<td><code>app</code></td>\n</tr>\n<tr>\n<td>Domain</td>\n<td>选择你的域名</td>\n<td><code>example.com</code></td>\n</tr>\n<tr>\n<td>Service Type</td>\n<td>本地服务协议</td>\n<td><code>HTTP</code> / <code>HTTPS</code> / <code>SSH</code></td>\n</tr>\n<tr>\n<td>URL</td>\n<td>本地服务地址</td>\n<td><code>localhost:8080</code></td>\n</tr>\n</tbody>\n</table>\n<p>点击 <strong>Save hostname</strong>，Cloudflare 会<strong>自动创建 CNAME DNS 记录</strong>，无需手动操作。规则<strong>实时生效，无需重启 cloudflared</strong>。</p>\n<h4 id=\"常见-service-配置示例\">常见 Service 配置示例</h4>\n<pre><code># Web 应用（HTTP）\nType: HTTP    URL: localhost:3000\n\n# 反向代理（HTTPS，忽略本地自签名证书）\nType: HTTPS   URL: localhost:443\nAdditional Settings → TLS → No TLS Verify: 开启\n\n# SSH 远程访问\nType: SSH     URL: localhost:22\n\n# 多个服务：添加多条 hostname，使用不同子域名即可\n</code></pre>\n<h3 id=\"token-轮换\">Token 轮换</h3>\n<p>当 token 泄露或需要定期轮换时：</p>\n<ol>\n<li>Dashboard → Tunnel → <strong>Edit</strong> → <strong>Refresh token</strong></li>\n<li>复制新 token</li>\n<li>更新 service 文件：</li>\n</ol>\n<pre><code class=\"language-bash\">sudo systemctl edit cloudflared --full\n# 找到 ExecStart 行，替换 --token 后面的值\n\nsudo systemctl daemon-reload\nsudo systemctl restart cloudflared\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"06\">\n<h2 id=\"方式二本地文件管理\">方式二：本地文件管理</h2>\n<p>本地管理方式将所有配置保存在服务器上，适合需要 Git 版本控制或 IaC 管理配置的场景。<strong>注意：每次修改配置后都需要重启 cloudflared 才能生效。</strong></p>\n<h3 id=\"第三步登录并授权\">第三步：登录并授权</h3>\n<pre><code class=\"language-bash\">cloudflared tunnel login\n</code></pre>\n<p>执行后会打开浏览器，登录 Cloudflare 账户并选择要使用的域名。成功后会在 <code>~/.cloudflared/cert.pem</code> 生成账户证书。</p>\n<h3 id=\"第四步创建-tunnel\">第四步：创建 Tunnel</h3>\n<pre><code class=\"language-bash\"># &lt;NAME&gt; 替换为你想要的 tunnel 名称，例如 my-server\ncloudflared tunnel create &lt;NAME&gt;\n</code></pre>\n<p>执行后会输出 tunnel UUID，并在 <code>~/.cloudflared/&lt;UUID&gt;.json</code> 生成 credentials 文件。记录这个 UUID，后续配置会用到。</p>\n<pre><code class=\"language-bash\"># 确认 tunnel 已创建\ncloudflared tunnel list\n</code></pre>\n<h3 id=\"第五步编写-configyml\">第五步：编写 config.yml</h3>\n<p>在 <code>/etc/cloudflared/config.yml</code> 创建配置文件：</p>\n<pre><code class=\"language-bash\">sudo mkdir -p /etc/cloudflared\nsudo nano /etc/cloudflared/config.yml\n</code></pre>\n<p>配置文件内容：</p>\n<pre><code class=\"language-yaml\"># Tunnel UUID（从上一步获取）\ntunnel: &lt;UUID&gt;\n\n# credentials 文件路径\ncredentials-file: /root/.cloudflared/&lt;UUID&gt;.json\n\n# 日志级别（可选）\nloglevel: info\n\n# 路由规则（ingress）\ningress:\n  # Web 应用\n  - hostname: app.example.com\n    service: http://localhost:3000\n\n  # HTTPS 服务（忽略本地证书）\n  - hostname: secure.example.com\n    service: https://localhost:443\n    originRequest:\n      noTLSVerify: true\n\n  # SSH 访问\n  - hostname: ssh.example.com\n    service: ssh://localhost:22\n\n  # 必须有一条 catch-all 规则作为最后一条\n  - service: http_status:404\n</code></pre>\n<blockquote>\n<p>⚠️ <code>ingress</code> 规则按顺序匹配，最后一条 catch-all（无 hostname）是必填项，否则 cloudflared 启动会报错。</p>\n</blockquote>\n<h4 id=\"常用-originrequest-参数\">常用 originRequest 参数</h4>\n<pre><code class=\"language-yaml\">ingress:\n  - hostname: app.example.com\n    service: http://localhost:3000\n    originRequest:\n      connectTimeout: 30s        # 连接超时\n      noTLSVerify: false         # 是否跳过证书验证\n      httpHostHeader: &quot;&quot;         # 自定义 Host Header\n      keepAliveTimeout: 90s      # 长连接保持时间\n</code></pre>\n<h3 id=\"第六步创建-dns-记录\">第六步：创建 DNS 记录</h3>\n<pre><code class=\"language-bash\"># 为每个 hostname 创建 CNAME 记录，指向 tunnel\ncloudflared tunnel route dns &lt;NAME&gt; app.example.com\ncloudflared tunnel route dns &lt;NAME&gt; ssh.example.com\n</code></pre>\n<p>这条命令等价于在 DNS 里添加：<code>app.example.com CNAME &lt;UUID&gt;.cfargotunnel.com</code></p>\n<h3 id=\"第七步注册为-systemd-服务\">第七步：注册为 systemd 服务</h3>\n<pre><code class=\"language-bash\"># cloudflared 会读取 /etc/cloudflared/config.yml\nsudo cloudflared service install\n\nsudo systemctl start cloudflared\nsudo systemctl enable cloudflared\nsudo systemctl status cloudflared\n</code></pre>\n<h3 id=\"修改配置后重启\">修改配置后重启</h3>\n<p>本地管理方式每次修改 <code>config.yml</code> 后必须重启服务才能生效：</p>\n<pre><code class=\"language-bash\">sudo systemctl restart cloudflared\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"07\">\n<h2 id=\"可选配置-private-network\">（可选）配置 Private Network</h2>\n<p>两种方式均支持通过 WARP 客户端访问内网 IP 段。</p>\n<p><strong>Dashboard 方式</strong>：在 Tunnel 详情页选择 <strong>Private Network</strong> 标签 → <strong>Add a private network</strong>，填写 CIDR。</p>\n<p><strong>本地管理方式</strong>：在 config.yml 中添加路由，并执行命令：</p>\n<pre><code class=\"language-bash\"># 将内网网段路由到 tunnel\ncloudflared tunnel route ip add 10.0.0.0/24 &lt;NAME&gt;\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"08\">\n<h2 id=\"验证访问\">验证访问</h2>\n<pre><code class=\"language-bash\"># 查看 tunnel 连接状态\nsudo journalctl -u cloudflared -f\n\n# 测试域名是否可达\ncurl -I https://app.example.com\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"09\">\n<h2 id=\"日常运维命令\">日常运维命令</h2>\n<pre><code class=\"language-bash\"># 查看服务状态\nsudo systemctl status cloudflared\n\n# 查看实时日志\nsudo journalctl -u cloudflared -f\n\n# 重启服务\nsudo systemctl restart cloudflared\n\n# 更新 cloudflared\nsudo apt upgrade cloudflared      # Debian/Ubuntu\nsudo yum update cloudflared       # RHEL/CentOS\n\n# 【本地管理】列出所有 tunnel\ncloudflared tunnel list\n\n# 【本地管理】删除 tunnel\ncloudflared tunnel delete &lt;NAME&gt;\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"10\">\n<h2 id=\"故障排查\">故障排查</h2>\n<table>\n<thead>\n<tr>\n<th>现象</th>\n<th>排查方向</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Dashboard 显示 Inactive</td>\n<td>检查 <code>systemctl status cloudflared</code>，查看日志</td>\n</tr>\n<tr>\n<td>Dashboard 显示 Down</td>\n<td>检查服务器是否能访问 <code>region1.v2.argotunnel.com:7844</code></td>\n</tr>\n<tr>\n<td>502 Bad Gateway</td>\n<td>检查本地服务是否在运行，URL 和端口是否正确</td>\n</tr>\n<tr>\n<td>SSL 证书错误</td>\n<td>开启 <code>noTLSVerify: true</code> 或检查本地证书</td>\n</tr>\n<tr>\n<td>端口被拒绝</td>\n<td>确认本地服务监听地址（<code>0.0.0.0</code> vs <code>127.0.0.1</code>）</td>\n</tr>\n<tr>\n<td>本地管理：启动报错</td>\n<td>检查 ingress 是否缺少 catch-all 规则，credentials 路径是否正确</td>\n</tr>\n</tbody>\n</table>\n<pre><code class=\"language-bash\"># 开启 debug 日志排查问题\n\n# Dashboard 方式\nsudo cloudflared tunnel --loglevel debug run --token &lt;TOKEN&gt;\n\n# 本地管理方式\nsudo cloudflared tunnel --loglevel debug run\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"11\">\n<h2 id=\"架构说明\">架构说明</h2>\n<pre><code>用户浏览器\n    │\n    ▼\nCloudflare 边缘节点（全球 CDN）\n    │  ← cloudflared 主动建立出站连接，无需开放入站端口\n    ▼\ncloudflared 守护进程（你的服务器）\n    │\n    ├── Dashboard 方式：路由规则由 Cloudflare 云端下发\n    └── 本地管理方式：路由规则读取本地 config.yml\n    │\n    ▼\n本地服务（localhost:端口）\n</code></pre>\n<p>两种方式共同优势：</p>\n<ul>\n<li><strong>无需开放防火墙端口</strong>，cloudflared 主动向外建立连接</li>\n<li><strong>无需公网 IP</strong>，服务器在 NAT 后面也能正常工作</li>\n<li><strong>自动 TLS</strong>，Cloudflare 边缘负责 HTTPS 证书，origin 可以是纯 HTTP</li>\n</ul>\n</section>\n",
    "tableOfContents": [
      {
        "depth": 2,
        "id": "两种方式对比",
        "text": "两种方式对比"
      },
      {
        "depth": 2,
        "id": "前置条件",
        "text": "前置条件"
      },
      {
        "depth": 2,
        "id": "第一步清理旧环境如有",
        "text": "第一步：清理旧环境（如有）"
      },
      {
        "depth": 2,
        "id": "第二步安装-cloudflared",
        "text": "第二步：安装 cloudflared"
      },
      {
        "depth": 3,
        "id": "debian--ubuntu",
        "text": "Debian / Ubuntu"
      },
      {
        "depth": 3,
        "id": "rhel--centos--rocky",
        "text": "RHEL / CentOS / Rocky"
      },
      {
        "depth": 3,
        "id": "验证安装",
        "text": "验证安装"
      },
      {
        "depth": 2,
        "id": "方式一dashboard-远程管理推荐",
        "text": "方式一：Dashboard 远程管理（推荐）"
      },
      {
        "depth": 3,
        "id": "第三步在-dashboard-创建-tunnel",
        "text": "第三步：在 Dashboard 创建 Tunnel"
      },
      {
        "depth": 3,
        "id": "第四步注册为-systemd-服务",
        "text": "第四步：注册为 systemd 服务"
      },
      {
        "depth": 3,
        "id": "第五步在-dashboard-配置路由规则",
        "text": "第五步：在 Dashboard 配置路由规则"
      },
      {
        "depth": 3,
        "id": "token-轮换",
        "text": "Token 轮换"
      },
      {
        "depth": 2,
        "id": "方式二本地文件管理",
        "text": "方式二：本地文件管理"
      },
      {
        "depth": 3,
        "id": "第三步登录并授权",
        "text": "第三步：登录并授权"
      },
      {
        "depth": 3,
        "id": "第四步创建-tunnel",
        "text": "第四步：创建 Tunnel"
      },
      {
        "depth": 3,
        "id": "第五步编写-configyml",
        "text": "第五步：编写 config.yml"
      },
      {
        "depth": 3,
        "id": "第六步创建-dns-记录",
        "text": "第六步：创建 DNS 记录"
      },
      {
        "depth": 3,
        "id": "第七步注册为-systemd-服务",
        "text": "第七步：注册为 systemd 服务"
      },
      {
        "depth": 3,
        "id": "修改配置后重启",
        "text": "修改配置后重启"
      },
      {
        "depth": 2,
        "id": "可选配置-private-network",
        "text": "（可选）配置 Private Network"
      },
      {
        "depth": 2,
        "id": "验证访问",
        "text": "验证访问"
      },
      {
        "depth": 2,
        "id": "日常运维命令",
        "text": "日常运维命令"
      },
      {
        "depth": 2,
        "id": "故障排查",
        "text": "故障排查"
      },
      {
        "depth": 2,
        "id": "架构说明",
        "text": "架构说明"
      }
    ],
    "tags": [
      "运维",
      "cloudflare",
      "tunnel",
      "内网穿透",
      "反向代理"
    ],
    "title": "Cloudflare Tunnel 完整方案"
  },
  {
    "noteUrl": "/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/",
    "date": "2026-04-01",
    "filename": "Oracle 多机集群零公网架构方案.md",
    "renderedContent": "<h1 id=\"oracle-多机集群零公网架构方案\">Oracle 多机集群零公网架构方案</h1>\n<section class=\"doc-section\" data-section-number=\"01\">\n<h2 id=\"tldr\">TL;DR</h2>\n<p>本方案是 <a href=\"/notes/personal-server-security-hardening-solution/\">个人服务器安全加固方案</a> 的<strong>多机扩展版</strong>。在零公网暴露的基础上，解决三个核心问题：</p>\n<ul>\n<li>🧠 <strong>多机分工</strong>：ARM 做性能，AMD 做稳定性</li>\n<li>🔄 <strong>容灾高可用</strong>：Tunnel 多入口，单点故障不宕机</li>\n<li>🛡️ <strong>防回收（可选）</strong>：保活策略降低 Oracle 免费实例被 reclaim 的风险</li>\n</ul>\n<blockquote>\n<p>前置条件：每台机器已完成 <a href=\"/notes/oracle-server-setup/\">Oracle 服务器开机 SOP</a> 和 <a href=\"/notes/personal-server-security-hardening-solution/\">个人服务器安全加固方案</a>\n相关文档：</p>\n<ul>\n<li>Tailscale 原理参见 <a href=\"/notes/n-8fdfccf8-31b5-463b-8822-d7377cf8f6d7/\">Tailscale 零公网暴露方案</a></li>\n<li>Tunnel 配置详解参见 <a href=\"/notes/cloudflare-tunnel-solution/\">Cloudflare Tunnel 完整方案</a></li>\n</ul>\n</blockquote>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"02\">\n<h2 id=\"整体架构\">整体架构</h2>\n<pre><code>          🌍 用户请求\n               ↓\n   ☁ Cloudflare（CDN + WAF）\n               ↓\n   🚇 Tunnel（多入口容灾）\n       ↓            ↓\n   AMD-1         AMD-2\n    ↓              ↓\n         👉 ARM 主服务器\n            （核心业务）\n\n管理员 → Tailscale 私网（100.x）→ 任意一台服务器 SSH\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"03\">\n<h2 id=\"三台机器分工\">三台机器分工</h2>\n<h3 id=\"核心思想\">核心思想</h3>\n<p><strong>最优解不是&quot;平均分配&quot;，而是：</strong></p>\n<ul>\n<li>🧠 <strong>ARM（4C24G）= 主力生产机（干所有重活）</strong></li>\n<li>🪶 <strong>AMD ×2（1C1G）= 边缘节点（保活 + 入口 + 备用）</strong></li>\n</ul>\n<p><strong>原则：重的全丢 ARM，轻的用 AMD 做&quot;永不掉线层&quot;</strong></p>\n<hr>\n<h3 id=\"arm4c24g主力生产机\">ARM（4C24G）——主力生产机</h3>\n<blockquote>\n<p>所有核心业务全放这里。</p>\n</blockquote>\n<p><strong>Docker 主集群：</strong></p>\n<ul>\n<li>Next.js（前端）</li>\n<li>API（Node / Python）</li>\n<li>AI 服务（embedding / 推理）</li>\n<li>图床服务、后台管理</li>\n</ul>\n<p><strong>数据层：</strong></p>\n<ul>\n<li>Redis（缓存）</li>\n<li>PostgreSQL / MySQL</li>\n</ul>\n<p><strong>系统服务：</strong></p>\n<ul>\n<li>Cloudflare Tunnel（主通道）</li>\n</ul>\n<h4 id=\"资源规划\">资源规划</h4>\n<table>\n<thead>\n<tr>\n<th>服务</th>\n<th>CPU</th>\n<th>内存</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Web/API</td>\n<td>1~2核</td>\n<td>4~8GB</td>\n</tr>\n<tr>\n<td>数据库</td>\n<td>1核</td>\n<td>4~8GB</td>\n</tr>\n<tr>\n<td>Redis</td>\n<td>0.5核</td>\n<td>2~4GB</td>\n</tr>\n<tr>\n<td>AI服务</td>\n<td>1核</td>\n<td>4~8GB</td>\n</tr>\n</tbody>\n</table>\n<blockquote>\n<p>总体控制在 <strong>70% 使用率以内</strong>（防止波动导致 OOM）</p>\n</blockquote>\n<hr>\n<h3 id=\"amd-1-入口节点高可用\">AMD #1 ——入口节点（高可用）</h3>\n<blockquote>\n<p>使命：<strong>保证你永远能访问系统（哪怕 ARM 挂了）</strong></p>\n</blockquote>\n<p><strong>部署内容：</strong></p>\n<ul>\n<li><strong>Cloudflare Tunnel</strong>：作为第二入口，指向 ARM 服务（通过 Tailscale IP）</li>\n<li><strong>Nginx fallback</strong>：ARM 不可达时返回静态维护页面</li>\n<li><strong>健康检查脚本</strong>：定期检测 ARM，不通则自动切换策略</li>\n</ul>\n<p>👉 <strong>ARM 挂了时：用户仍能访问，不会 502 / 断连</strong></p>\n<hr>\n<h3 id=\"amd-2-保活节点防回收可选\">AMD #2 ——保活节点（防回收，可选）</h3>\n<blockquote>\n<p>Oracle 免费实例存在被回收的风险。但需要注意：Oracle 官方<strong>未公开具体的回收条件</strong>，社区流传的标准均为经验推测。</p>\n</blockquote>\n<p><strong>部署内容：</strong></p>\n<ul>\n<li><strong>保活 cron 任务</strong>：定时产生 CPU/网络活动</li>\n<li><strong>轻量状态 API</strong>：返回健康状态，供监控使用</li>\n<li><strong>备用 Tunnel</strong>：第三入口，终极容灾</li>\n</ul>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"04\">\n<h2 id=\"tunnel-多入口容灾策略\">Tunnel 多入口容灾策略</h2>\n<blockquote>\n<p>Tunnel 基础配置（安装、config.yml、systemd）参见 <a href=\"/notes/cloudflare-tunnel-solution/\">Cloudflare Tunnel 完整方案</a>\n这里仅说明<strong>多入口差异化配置</strong>。</p>\n</blockquote>\n<h3 id=\"部署方式\">部署方式</h3>\n<p>在三台机器上使用<strong>同一个 Tunnel ID</strong> 运行：</p>\n<pre><code class=\"language-bash\">cloudflared tunnel run homelab\n</code></pre>\n<p>Cloudflare 会自动将多个 connector 纳入同一 Tunnel，实现负载均衡和故障转移。</p>\n<h3 id=\"各节点-ingress-配置差异\">各节点 ingress 配置差异</h3>\n<p><strong>ARM（主节点）：</strong> 直接指向本地服务</p>\n<pre><code class=\"language-yaml\">ingress:\n  - hostname: api.yourdomain.com\n    service: http://localhost:3000\n  - service: http_status:404\n</code></pre>\n<p><strong>AMD-1 / AMD-2（边缘节点）：</strong> 通过 Tailscale IP 转发到 ARM</p>\n<pre><code class=\"language-yaml\">ingress:\n  - hostname: api.yourdomain.com\n    service: http://100.x.x.x:3000  # ARM 的 Tailscale IP\n  - service: http_status:404\n</code></pre>\n<h3 id=\"容灾效果\">容灾效果</h3>\n<table>\n<thead>\n<tr>\n<th>故障场景</th>\n<th>用户体验</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>ARM 正常</td>\n<td>Cloudflare 优先路由到 ARM</td>\n</tr>\n<tr>\n<td>ARM 宕机</td>\n<td>自动切到 AMD-1 或 AMD-2</td>\n</tr>\n<tr>\n<td>ARM + AMD-1 同时宕机</td>\n<td>AMD-2 兜底</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"05\">\n<h2 id=\"保活策略可选防-oracle-回收\">保活策略（可选，防 Oracle 回收）</h2>\n<blockquote>\n<p>⚠️ <strong>关于回收条件</strong>：Oracle 官方文档中<strong>没有明确说明</strong>免费实例的具体回收标准。社区中广泛流传的“7天CPU&lt;10% + 网络流量极少”是用户根据经验总结的推测，<strong>并非官方规则</strong>。</p>\n<p>以下保活策略是一种<strong>预防性措施</strong>，你可以根据自己的风险偏好决定是否配置。</p>\n</blockquote>\n<h3 id=\"amd-保活-cron-配置\">AMD 保活 cron 配置</h3>\n<pre><code class=\"language-bash\"># 每 5 分钟 curl ARM 的健康检查接口（产生网络活动）\n*/5 * * * * curl -s http://100.x.x.x:3000/health &gt; /dev/null 2&gt;&amp;1\n\n# 每小时轻量计算（产生 CPU 活动）\n0 * * * * dd if=/dev/urandom bs=1M count=10 | md5sum &gt; /dev/null 2&gt;&amp;1\n</code></pre>\n<h3 id=\"arm-保活\">ARM 保活</h3>\n<p>ARM 通常负载足够（跑着所有业务），一般不需要额外保活。但建议：</p>\n<ul>\n<li>确保至少有 1 个服务持续运行（哪怕是空跑的 health API）</li>\n<li>AMD 的定时 curl 本身也会给 ARM 产生流量</li>\n</ul>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"06\">\n<h2 id=\"docker-部署实践\">Docker 部署实践</h2>\n<h3 id=\"服务目录结构arm\">服务目录结构（ARM）</h3>\n<pre><code>/app\n ├── docker-compose.yml\n ├── nginx/\n ├── api/\n ├── frontend/\n ├── redis/\n ├── postgres/\n └── ai-service/\n</code></pre>\n<h3 id=\"关键限制每个容器的资源上限\">关键：限制每个容器的资源上限</h3>\n<pre><code class=\"language-yaml\">services:\n  api:\n    image: your-api:latest\n    deploy:\n      resources:\n        limits:\n          cpus: '1'\n          memory: 1G\n</code></pre>\n<blockquote>\n<p>必须设置资源限制，防止单个服务吃满整台机器导致连锁 OOM。</p>\n</blockquote>\n<h3 id=\"arm-镜像选择\">ARM 镜像选择</h3>\n<p>选择支持 <code>linux/arm64</code> 的镜像：</p>\n<pre><code>node:18-alpine\npython:3.11-slim\npostgres:16-alpine\nredis:7-alpine\n</code></pre>\n<blockquote>\n<p>多架构镜像构建参见 <span>Docker 本地构建多架构镜像并部署全流程总结</span></p>\n</blockquote>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"07\">\n<h2 id=\"最关键的-3-条原则\">最关键的 3 条原则</h2>\n<ol>\n<li><strong>ARM 只做一件事：跑业务</strong> — 不在 ARM 上做保活、探测、杂任务</li>\n<li><strong>AMD 建议&quot;制造流量&quot;（可选）</strong> — 降低被 Oracle 回收的风险</li>\n<li><strong>Tunnel 一定多点部署</strong> — 这是免费实现高可用的核心</li>\n</ol>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"08\">\n<h2 id=\"一句话总结\">一句话总结</h2>\n<blockquote>\n<p><strong>用 ARM 做性能，用 AMD 做稳定性，用 Cloudflare 做大脑。</strong></p>\n</blockquote>\n</section>\n",
    "tableOfContents": [
      {
        "depth": 2,
        "id": "tldr",
        "text": "TL;DR"
      },
      {
        "depth": 2,
        "id": "整体架构",
        "text": "整体架构"
      },
      {
        "depth": 2,
        "id": "三台机器分工",
        "text": "三台机器分工"
      },
      {
        "depth": 3,
        "id": "核心思想",
        "text": "核心思想"
      },
      {
        "depth": 3,
        "id": "arm4c24g主力生产机",
        "text": "ARM（4C24G）——主力生产机"
      },
      {
        "depth": 3,
        "id": "amd-1-入口节点高可用",
        "text": "AMD #1 ——入口节点（高可用）"
      },
      {
        "depth": 3,
        "id": "amd-2-保活节点防回收可选",
        "text": "AMD #2 ——保活节点（防回收，可选）"
      },
      {
        "depth": 2,
        "id": "tunnel-多入口容灾策略",
        "text": "Tunnel 多入口容灾策略"
      },
      {
        "depth": 3,
        "id": "部署方式",
        "text": "部署方式"
      },
      {
        "depth": 3,
        "id": "各节点-ingress-配置差异",
        "text": "各节点 ingress 配置差异"
      },
      {
        "depth": 3,
        "id": "容灾效果",
        "text": "容灾效果"
      },
      {
        "depth": 2,
        "id": "保活策略可选防-oracle-回收",
        "text": "保活策略（可选，防 Oracle 回收）"
      },
      {
        "depth": 3,
        "id": "amd-保活-cron-配置",
        "text": "AMD 保活 cron 配置"
      },
      {
        "depth": 3,
        "id": "arm-保活",
        "text": "ARM 保活"
      },
      {
        "depth": 2,
        "id": "docker-部署实践",
        "text": "Docker 部署实践"
      },
      {
        "depth": 3,
        "id": "服务目录结构arm",
        "text": "服务目录结构（ARM）"
      },
      {
        "depth": 3,
        "id": "关键限制每个容器的资源上限",
        "text": "关键：限制每个容器的资源上限"
      },
      {
        "depth": 3,
        "id": "arm-镜像选择",
        "text": "ARM 镜像选择"
      },
      {
        "depth": 2,
        "id": "最关键的-3-条原则",
        "text": "最关键的 3 条原则"
      },
      {
        "depth": 2,
        "id": "一句话总结",
        "text": "一句话总结"
      }
    ],
    "tags": [
      "运维",
      "oracle",
      "架构",
      "tailscale",
      "高可用"
    ],
    "title": "Oracle 多机集群零公网架构方案"
  },
  {
    "noteUrl": "/notes/n-8fdfccf8-31b5-463b-8822-d7377cf8f6d7/",
    "date": "2026-04-01",
    "filename": "Tailscale 零公网暴露方案.md",
    "renderedContent": "<h1 id=\"tailscale-零公网暴露方案\">Tailscale 零公网暴露方案</h1>\n<section class=\"doc-section\" data-section-number=\"01\">\n<h2 id=\"方案目标\">方案目标</h2>\n<ul>\n<li>不开放任何公网端口（0 暴露）</li>\n<li>禁用公网 SSH</li>\n<li>使用 Tailscale 进行私网访问</li>\n<li>自动适配：\n<ul>\n<li>UDP P2P 打洞（优先）</li>\n<li>DERP 中继（兜底）</li>\n</ul>\n</li>\n</ul>\n<blockquote>\n<p>📌 <strong>快速使用</strong>：如果你只想快速部署 Tailscale，直接跳到 <a href=\"#%E5%AE%89%E8%A3%85%E4%B8%8E%E9%83%A8%E7%BD%B2\">安装与部署</a>。\n后续章节是 P2P/DERP 全链路的技术解析，供深入了解时阅读。</p>\n</blockquote>\n<blockquote>\n<p>相关文档：</p>\n<ul>\n<li>基础安全加固参见 <a href=\"/notes/personal-server-security-hardening-solution/\">个人服务器安全加固方案</a></li>\n<li>多机集群架构参见 <a href=\"/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/\">Oracle 多机集群零公网架构方案</a>（Oracle 免费层专用）</li>\n<li>对外服务发布参见 <a href=\"/notes/cloudflare-tunnel-solution/\">Cloudflare Tunnel 完整方案</a></li>\n</ul>\n</blockquote>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"02\">\n<h2 id=\"整体架构\">整体架构</h2>\n<pre><code>                 🌍 互联网\n                      │\n        ┌─────────────┴─────────────┐\n        │                           │\n   🖥 你的电脑                 🧠 服务器\n   Tailscale Client          Tailscale Client\n        │                           │\n        └─────── 控制面协调 ────────┘\n                      │\n        ┌─────────────┴─────────────┐\n        │                           │\n   🚀 P2P UDP直连（优先）      🐢 DERP中继（兜底）\n</code></pre>\n</section>\n<section class=\"doc-section\" data-section-number=\"03\">\n<h2 id=\"安装与部署\">安装与部署</h2>\n<pre><code class=\"language-bash\">curl -fsSL https://tailscale.com/install.sh | sh\n</code></pre>\n<h3 id=\"启动并加入网络\">启动并加入网络</h3>\n<pre><code class=\"language-bash\">tailscale up\n</code></pre>\n<blockquote>\n<p>💡 这里<strong>不加</strong> <code>--ssh</code>。<code>--ssh</code> 会启用 Tailscale 内置的 SSH 服务（替代 sshd），而我们的场景是继续使用服务器自身的 sshd 管理 SSH 连接，Tailscale 仅用于虚拟组网实现零公网暴露。</p>\n</blockquote>\n<h3 id=\"查看分配-ip\">查看分配 IP</h3>\n<pre><code class=\"language-bash\">tailscale ip -4\n</code></pre>\n<p>示例输出：</p>\n<pre><code>100.101.23.5\n</code></pre>\n<h3 id=\"ssh-登录核心方式\">SSH 登录（核心方式）</h3>\n<pre><code class=\"language-bash\">ssh root@100.x.x.x\n</code></pre>\n<h3 id=\"持久化配置防止密钥过期\">持久化配置（防止密钥过期）</h3>\n<p>登录 <a href=\"https://login.tailscale.com/admin/machines\">Tailscale Admin Console</a>，找到该机器 → <strong>Edit machine settings</strong> → 勾选 <strong>Disable key expiry</strong>。</p>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"04\">\n<h2 id=\"p2p-udp-打洞全链路核心\">P2P UDP 打洞全链路（核心）</h2>\n<h3 id=\"流程图\">流程图</h3>\n<pre><code>你电脑                         服务器\n   │                               │\n   │ 1️⃣ 登录控制服务器              │\n   ├──────────────►               │\n   │                               │\n   │ 2️⃣ 获取对方公网IP + 端口        │\n   │◄──────────────┤               │\n   │                               │\n   │ 3️⃣ UDP 打洞（同时发包）         │\n   ├──────────────►               │\n   │◄──────────────┤               │\n   │                               │\n   │ 4️⃣ 建立 P2P 通道               │\n   │◄══════════════►│\n   │                               │\n   │ 5️⃣ SSH 流量（加密）             │\n   │◄══════════════►│\n</code></pre>\n<h3 id=\"实际数据路径\">实际数据路径</h3>\n<pre><code>SSH\n ↓\nTailscale 虚拟网卡（tun）\n ↓\nWireGuard 加密\n ↓\nUDP → 对端公网IP\n ↓\n对端解密\n ↓\nsshd（22端口）\n</code></pre>\n<h3 id=\"特点\">特点</h3>\n<table>\n<thead>\n<tr>\n<th>项目</th>\n<th>值</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>连接方式</td>\n<td>UDP直连</td>\n</tr>\n<tr>\n<td>是否依赖入站</td>\n<td>❌ 不需要</td>\n</tr>\n<tr>\n<td>延迟</td>\n<td>🚀 低（10~50ms）</td>\n</tr>\n<tr>\n<td>带宽</td>\n<td>高</td>\n</tr>\n<tr>\n<td>稳定性</td>\n<td>受 NAT 类型影响</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"05\">\n<h2 id=\"derp-中继全链路兜底机制\">DERP 中继全链路（兜底机制）</h2>\n<p>当 P2P 打洞失败时（对称型 NAT），流量自动切换到 DERP 中继。</p>\n<h3 id=\"流程图-1\">流程图</h3>\n<pre><code>你电脑                DERP服务器               服务器\n   │                     │                     │\n   │ 1️⃣ 出站连接          │                     │\n   ├──────────────►      │                     │\n   │                     │                     │\n   │                     │◄──────────────┤\n   │                     │   2️⃣ 出站连接       │\n   │                     │                     │\n   │ 3️⃣ SSH数据           │                     │\n   ├──────────────►      │                     │\n   │                     │ 4️⃣ 转发              │\n   │                     ├──────────────►      │\n   │                     │                     │\n   │                     │ 5️⃣ 返回              │\n   │◄──────────────┤      │                     │\n</code></pre>\n<h3 id=\"ssh-数据流详解\">SSH 数据流详解</h3>\n<p>当使用 DERP 中继时，SSH 连接的实际路径：</p>\n<pre><code>1️⃣ 服务器 → DERP（TCP 443，出站连接）\n2️⃣ 你电脑 → DERP（TCP 443，出站连接）\n\n3️⃣ 你执行：ssh root@100.x.x.x\n\n4️⃣ SSH数据：\n   ↓\n   Tailscale 虚拟网卡（tun）\n   ↓\n   WireGuard 加密\n   ↓\n   发送给 DERP（通过你已有连接）\n\n5️⃣ DERP：\n   ↓\n   把数据写入&quot;服务器那条已建立连接&quot;\n\n6️⃣ 服务器：\n   ↓\n   从该连接读取数据\n   ↓\n   Tailscale 解密\n   ↓\n   送入本地 22 端口（sshd）\n</code></pre>\n<h3 id=\"特点-1\">特点</h3>\n<table>\n<thead>\n<tr>\n<th>项目</th>\n<th>值</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>连接方式</td>\n<td>TCP中继</td>\n</tr>\n<tr>\n<td>是否依赖入站</td>\n<td>❌ 不需要</td>\n</tr>\n<tr>\n<td>延迟</td>\n<td>🐢 较高（100ms+）</td>\n</tr>\n<tr>\n<td>带宽</td>\n<td>较低</td>\n</tr>\n<tr>\n<td>稳定性</td>\n<td>稳定，不受 NAT 影响</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"06\">\n<h2 id=\"p2p-vs-derp-对比\">P2P vs DERP 对比</h2>\n<table>\n<thead>\n<tr>\n<th>项目</th>\n<th>P2P</th>\n<th>DERP</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>连接方式</td>\n<td>UDP直连</td>\n<td>TCP中继</td>\n</tr>\n<tr>\n<td>是否依赖入站</td>\n<td>❌</td>\n<td>❌</td>\n</tr>\n<tr>\n<td>延迟</td>\n<td>🚀低</td>\n<td>🐢高</td>\n</tr>\n<tr>\n<td>带宽</td>\n<td>高</td>\n<td>较低</td>\n</tr>\n<tr>\n<td>稳定性</td>\n<td>受 NAT 影响</td>\n<td>稳定</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"07\">\n<h2 id=\"如何判断当前连接类型\">如何判断当前连接类型</h2>\n<h3 id=\"方法一tailscale-status\">方法一：<code>tailscale status</code></h3>\n<pre><code class=\"language-bash\">tailscale status\n</code></pre>\n<p>输出 <code>active; direct</code> → ✅ P2P<br>\n输出 <code>active; relay</code> → 🐢 DERP</p>\n<h3 id=\"方法二tailscale-ping推荐\">方法二：<code>tailscale ping</code>（推荐）</h3>\n<pre><code class=\"language-bash\">tailscale ping 服务器IP\n</code></pre>\n<p>输出 <code>via 1.2.3.4:41641</code> → ✅ P2P<br>\n输出 <code>via DERP(lax)</code> → 🐢 DERP</p>\n<h3 id=\"方法三抓包\">方法三：抓包</h3>\n<pre><code class=\"language-bash\">tcpdump -i any udp or port 443\n</code></pre>\n<table>\n<thead>\n<tr>\n<th>结果</th>\n<th>类型</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>UDP公网IP</td>\n<td>P2P</td>\n</tr>\n<tr>\n<td>TCP 443</td>\n<td>DERP</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"08\">\n<h2 id=\"为什么可以0公网暴露\">为什么可以&quot;0公网暴露&quot;？</h2>\n<h3 id=\"核心原因\">核心原因</h3>\n<p>所有连接都是：<strong>服务器主动发起（出站）</strong></p>\n<h3 id=\"防火墙行为关键\">防火墙行为（关键）</h3>\n<p>主流云平台的防火墙都具有**有状态（stateful）**特性：</p>\n<pre><code>允许出站 → 自动允许回流\n</code></pre>\n<blockquote>\n<p>适用于 Oracle Cloud、AWS、GCP、腾讯云、阿里云等所有主流平台。</p>\n</blockquote>\n<p>因此：</p>\n<ul>\n<li>❌ 不需要开放 22</li>\n<li>❌ 不需要开放任何端口</li>\n</ul>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"09\">\n<h2 id=\"最终架构总结\">最终架构总结</h2>\n<pre><code>SSH：\n你 → Tailscale →（P2P UDP 或 DERP TCP）→ 服务器\n\n特点：\n✔ 端口不暴露\n✔ 自动切换链路\n✔ 端到端加密\n✔ 零信任访问\n</code></pre>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"10\">\n<h2 id=\"常见问题与排查\">常见问题与排查</h2>\n<table>\n<thead>\n<tr>\n<th>问题</th>\n<th>排查命令</th>\n<th>解决方案</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>无法连接</td>\n<td><code>tailscale status</code></td>\n<td>检查 Tailscale 是否在线</td>\n</tr>\n<tr>\n<td>强制 DERP</td>\n<td><code>iptables -A OUTPUT -p udp -j DROP</code></td>\n<td>测试 DERP 兜底是否正常</td>\n</tr>\n<tr>\n<td>查看网络类型</td>\n<td><code>tailscale netcheck</code></td>\n<td>确认当前连接模式</td>\n</tr>\n</tbody>\n</table>\n<hr>\n</section>\n<section class=\"doc-section\" data-section-number=\"11\">\n<h2 id=\"一句话总结\">一句话总结</h2>\n<blockquote>\n<p>使用 Tailscale 可以在不开放任何公网端口的前提下，通过 UDP 打洞实现 P2P 直连，并在失败时自动切换到 DERP 中继，实现稳定、安全的零暴露服务器访问架构。</p>\n</blockquote>\n</section>\n",
    "tableOfContents": [
      {
        "depth": 2,
        "id": "方案目标",
        "text": "方案目标"
      },
      {
        "depth": 2,
        "id": "整体架构",
        "text": "整体架构"
      },
      {
        "depth": 2,
        "id": "安装与部署",
        "text": "安装与部署"
      },
      {
        "depth": 3,
        "id": "启动并加入网络",
        "text": "启动并加入网络"
      },
      {
        "depth": 3,
        "id": "查看分配-ip",
        "text": "查看分配 IP"
      },
      {
        "depth": 3,
        "id": "ssh-登录核心方式",
        "text": "SSH 登录（核心方式）"
      },
      {
        "depth": 3,
        "id": "持久化配置防止密钥过期",
        "text": "持久化配置（防止密钥过期）"
      },
      {
        "depth": 2,
        "id": "p2p-udp-打洞全链路核心",
        "text": "P2P UDP 打洞全链路（核心）"
      },
      {
        "depth": 3,
        "id": "流程图",
        "text": "流程图"
      },
      {
        "depth": 3,
        "id": "实际数据路径",
        "text": "实际数据路径"
      },
      {
        "depth": 3,
        "id": "特点",
        "text": "特点"
      },
      {
        "depth": 2,
        "id": "derp-中继全链路兜底机制",
        "text": "DERP 中继全链路（兜底机制）"
      },
      {
        "depth": 3,
        "id": "流程图-1",
        "text": "流程图"
      },
      {
        "depth": 3,
        "id": "ssh-数据流详解",
        "text": "SSH 数据流详解"
      },
      {
        "depth": 3,
        "id": "特点-1",
        "text": "特点"
      },
      {
        "depth": 2,
        "id": "p2p-vs-derp-对比",
        "text": "P2P vs DERP 对比"
      },
      {
        "depth": 2,
        "id": "如何判断当前连接类型",
        "text": "如何判断当前连接类型"
      },
      {
        "depth": 3,
        "id": "方法一tailscale-status",
        "text": "方法一：tailscale status"
      },
      {
        "depth": 3,
        "id": "方法二tailscale-ping推荐",
        "text": "方法二：tailscale ping（推荐）"
      },
      {
        "depth": 3,
        "id": "方法三抓包",
        "text": "方法三：抓包"
      },
      {
        "depth": 2,
        "id": "为什么可以0公网暴露",
        "text": "为什么可以\"0公网暴露\"？"
      },
      {
        "depth": 3,
        "id": "核心原因",
        "text": "核心原因"
      },
      {
        "depth": 3,
        "id": "防火墙行为关键",
        "text": "防火墙行为（关键）"
      },
      {
        "depth": 2,
        "id": "最终架构总结",
        "text": "最终架构总结"
      },
      {
        "depth": 2,
        "id": "常见问题与排查",
        "text": "常见问题与排查"
      },
      {
        "depth": 2,
        "id": "一句话总结",
        "text": "一句话总结"
      }
    ],
    "tags": [
      "运维",
      "tailscale",
      "网络",
      "安全",
      "零公网暴露"
    ],
    "title": "Tailscale 零公网暴露方案"
  }
];
