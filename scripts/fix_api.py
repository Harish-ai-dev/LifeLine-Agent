import os
api_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\utils\apiClient.ts"
with open(api_path, "r", encoding="utf-8") as f:
    content = f.read()

import re
# The broken part is around line 60:
#   private saveOfflineRequest(req: any) {
#     const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
#     queue.push(req);
#     localStorage.setItem('offlineQueue', JSON.stringify(queue));
#   });
#     this.setToken(data.token);
#     return data;
#   }
# 
#   async getMe(): Promise<AuthUser> {

content = re.sub(r"localStorage\.setItem\('offlineQueue', JSON\.stringify\(queue\)\);\n\s*\}\);\n\s*this\.setToken\(data\.token\);\n\s*return data;\n\s*\}", 
                 r"localStorage.setItem('offlineQueue', JSON.stringify(queue));\n  }", 
                 content)

with open(api_path, "w", encoding="utf-8") as f:
    f.write(content)
print("apiClient fixed")
