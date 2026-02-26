#!/usr/bin/env python3
"""本地开发服务器，禁用缓存，确保每次刷新都能获取最新文件。"""
import http.server, functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # 静默日志

if __name__ == '__main__':
    PORT = 3000
    handler = functools.partial(NoCacheHandler, directory='.')
    with http.server.HTTPServer(('', PORT), handler) as httpd:
        print(f'服务已启动：http://localhost:{PORT}  (Ctrl+C 停止)')
        httpd.serve_forever()
