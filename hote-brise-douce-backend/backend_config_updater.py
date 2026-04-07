import os
import xml.etree.ElementTree as ET
import glob

base_dir = r"c:\Users\islem\IdeaProjects\devunity-hotel-brise-douce\hote-brise-douce-backend"
server_config_dir = os.path.join(base_dir, "ServerConfig", "src", "main", "resources", "config")

# We apply this to directories that have a pom.xml (so they are Java services)
# Except for ServerConfig, Discovery, API_Gateway (gateway might need it too actually, but let's just do standard MS)
skip_dirs = ['ServerConfig', 'Discovery', '.idea']

for item in os.listdir(base_dir):
    service_dir = os.path.join(base_dir, item)
    if os.path.isdir(service_dir) and item not in skip_dirs:
        pom_path = os.path.join(service_dir, "pom.xml")
        app_prop_path = os.path.join(service_dir, "src", "main", "resources", "application.properties")
        
        if os.path.exists(pom_path):
            print(f"Processing {item}...")
            
            # Read application.properties to get the name and add config
            if os.path.exists(app_prop_path):
                with open(app_prop_path, 'r', encoding='utf-8') as f:
                    props = f.read()
                
                app_name = None
                for line in props.splitlines():
                    if line.startswith("spring.application.name="):
                        app_name = line.split("=")[1].strip()
                
                if not app_name:
                    app_name = item.lower().replace('_', '-')
                    props += f'\nspring.application.name={app_name}\n'

                need_config = "spring.cloud.config.enabled=true" not in props
                need_import = "spring.config.import=optional:configserver" not in props
                need_actuator = "management.endpoints.web.exposure.include" not in props
                
                if need_config or need_import or need_actuator:
                    with open(app_prop_path, 'a', encoding='utf-8') as f:
                        f.write("\n\n# Config Server & Actuator Configuration")
                        if need_config:
                            f.write("\nspring.cloud.config.enabled=true")
                        if need_import:
                            f.write("\nspring.config.import=optional:configserver:http://localhost:8888")
                        if need_actuator:
                            f.write("\nmanagement.endpoints.web.exposure.include=*")
                            
                # Create the corresponding file in ServerConfig
                central_prop_path = os.path.join(server_config_dir, f"{app_name}.properties")
                with open(central_prop_path, 'w', encoding='utf-8') as f:
                    f.write(f"welcome.message=Welcome to {item.replace('_', ' ')}\n")
                    f.write("server.error.include-message=always\n")

            # Update pom.xml
            ET.register_namespace('', "http://maven.apache.org/POM/4.0.0")
            try:
                tree = ET.parse(pom_path)
                root = tree.getroot()
                ns = "{http://maven.apache.org/POM/4.0.0}"
                deps = root.find(f'{ns}dependencies')
                if deps is not None:
                    has_config = False
                    has_actuator = False
                    for dep in deps.findall(f'{ns}dependency'):
                        artifactId = dep.find(f'{ns}artifactId')
                        if artifactId is not None:
                            if artifactId.text == 'spring-cloud-starter-config':
                                has_config = True
                            if artifactId.text == 'spring-boot-starter-actuator':
                                has_actuator = True
                    
                    changed = False
                    if not has_config:
                        new_dep = ET.Element(f"{ns}dependency")
                        grp = ET.SubElement(new_dep, f"{ns}groupId")
                        grp.text = "org.springframework.cloud"
                        art = ET.SubElement(new_dep, f"{ns}artifactId")
                        art.text = "spring-cloud-starter-config"
                        deps.append(new_dep)
                        changed = True
                    
                    if not has_actuator:
                        new_dep = ET.Element(f"{ns}dependency")
                        grp = ET.SubElement(new_dep, f"{ns}groupId")
                        grp.text = "org.springframework.boot"
                        art = ET.SubElement(new_dep, f"{ns}artifactId")
                        art.text = "spring-boot-starter-actuator"
                        deps.append(new_dep)
                        changed = True
                        
                    if changed:
                        # Prettify simple
                        tree.write(pom_path, encoding='utf-8', xml_declaration=True)
                        print(f"Updated pom.xml for {item}")
            except Exception as e:
                print(f"Failed to parse or write {pom_path}: {e}")

print("Done updating services.")
