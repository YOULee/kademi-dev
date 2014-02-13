fuse-web-dev
============

Contains source code for web page templates.

Running the project from netbeans:


1. Download and install Netbeans with the webapp. Get the bundle with the JDK if you dont already have java installed
2. Open the fuse-web-dev project in Netbeans.
3. Run the project - right click on the project and select Run
4. With your web browser open http://loopbackdns.com:8080/ - this domain name is
a special one which resolves to the local IP 127.0.0.1. This license that comes
with this project will only work with this domain name
5. Login to the admin console with admin/password8
6. Click "create a website" from the dashboard, or from the manage websites page
7. Use a name eg "web1" - this will create a website at http://web1.loopbackdns.com:8080/
8. Then click the "view website" button to see it in your browser
9. Enjoy!

Run the project from maven:
The pom has a "run-tomcat" profile which causes the tomcat plugin to execute. So just do a build with the run-tomcat profile active. Eg

mvn -Prun-tomcat compile

Themes
------
This system uses themes which are under src/main/webapp/templates/themes. The old default theme
for the admin console is "admin" and the new one is "admin2". You can override
the default by editing src/main/resources/spliffy-env.properties (spliffy is the old
code name for this project)
