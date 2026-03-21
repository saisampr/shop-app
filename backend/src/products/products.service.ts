import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, FindOptionsWhere, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './product.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    const count = await this.productRepo.count();
    if (count === 0) {
      await this.productRepo.save([
        // Electronics
        { name: '4K OLED Smart TV 55"', description: '55-inch 4K OLED display with HDR10+ and built-in streaming apps', price: 1299.99, stock: 12, image: 'https://picsum.photos/seed/tv55oled/300/200', category: 'Electronics' },
        { name: 'Laptop 15" Intel Core i7', description: '15.6-inch FHD laptop with i7 processor, 16GB RAM, 512GB SSD', price: 999.99, stock: 18, image: 'https://picsum.photos/seed/laptopi7/300/200', category: 'Electronics' },
        { name: 'Desktop PC Gaming Tower', description: 'High-performance gaming desktop with RTX 4070 and 32GB DDR5 RAM', price: 1799.99, stock: 7, image: 'https://picsum.photos/seed/gamingtower/300/200', category: 'Electronics' },
        { name: 'Curved 32" Monitor', description: '32-inch QHD curved monitor with 165Hz refresh rate and 1ms response time', price: 449.99, stock: 14, image: 'https://picsum.photos/seed/curvedmonitor/300/200', category: 'Electronics' },
        { name: 'Tablet 10" Android', description: '10-inch Android tablet with 2K display, 8GB RAM and stylus support', price: 349.99, stock: 22, image: 'https://picsum.photos/seed/androidtablet/300/200', category: 'Electronics' },
        { name: 'Mini PC Intel NUC', description: 'Compact mini PC with Intel Core i5, 8GB RAM, 256GB SSD', price: 499.99, stock: 9, image: 'https://picsum.photos/seed/minipcinuc/300/200', category: 'Electronics' },
        { name: 'All-in-One PC 27"', description: '27-inch all-in-one desktop with touch display and AMD Ryzen 7', price: 1199.99, stock: 6, image: 'https://picsum.photos/seed/allinonetpc/300/200', category: 'Electronics' },
        { name: 'E-Reader 7" Paperwhite', description: 'Waterproof e-reader with 7-inch glare-free display and 3-month battery life', price: 139.99, stock: 30, image: 'https://picsum.photos/seed/ereaderwhite/300/200', category: 'Electronics' },
        { name: 'Portable Projector 1080p', description: 'Full HD portable projector with 500 lumens and built-in speaker', price: 379.99, stock: 11, image: 'https://picsum.photos/seed/projector1080/300/200', category: 'Electronics' },
        { name: 'Raspberry Pi 5 Starter Kit', description: 'Raspberry Pi 5 4GB bundle with case, power supply, and 32GB SD card', price: 89.99, stock: 25, image: 'https://picsum.photos/seed/raspberrypi5/300/200', category: 'Electronics' },

        // Audio
        { name: 'Noise-Cancelling Headphones', description: 'Over-ear ANC headphones with 30-hour battery and premium sound', price: 299.99, stock: 16, image: 'https://picsum.photos/seed/anc300headphones/300/200', category: 'Audio' },
        { name: 'True Wireless Earbuds Pro', description: 'Active noise cancellation earbuds with 8-hour playtime and wireless charging case', price: 179.99, stock: 28, image: 'https://picsum.photos/seed/earbudspro/300/200', category: 'Audio' },
        { name: 'Soundbar 2.1 with Subwoofer', description: '2.1 channel soundbar with wireless subwoofer, Dolby Atmos and HDMI ARC', price: 349.99, stock: 10, image: 'https://picsum.photos/seed/soundbar21/300/200', category: 'Audio' },
        { name: 'Studio Monitor Speakers', description: 'Professional 5-inch studio monitor speakers for accurate audio mixing', price: 259.99, stock: 8, image: 'https://picsum.photos/seed/studiomonitors/300/200', category: 'Audio' },
        { name: 'Bluetooth Speaker Waterproof', description: 'IP67 waterproof portable speaker with 360° sound and 20-hour battery', price: 89.99, stock: 35, image: 'https://picsum.photos/seed/btspeakerwp/300/200', category: 'Audio' },
        { name: 'USB Condenser Microphone', description: 'Cardioid condenser microphone with built-in headphone monitoring for streaming', price: 119.99, stock: 20, image: 'https://picsum.photos/seed/usbmicro/300/200', category: 'Audio' },
        { name: 'Vinyl Record Player', description: 'Belt-drive turntable with built-in preamp and Bluetooth output', price: 199.99, stock: 12, image: 'https://picsum.photos/seed/vinylplayer/300/200', category: 'Audio' },
        { name: 'DAC Amplifier Desktop', description: 'Hi-Fi USB DAC and headphone amplifier with balanced 4.4mm output', price: 229.99, stock: 9, image: 'https://picsum.photos/seed/dacamplifier/300/200', category: 'Audio' },
        { name: 'Sport Wireless Earphones', description: 'Sweat-resistant wireless earphones with ear hooks and 12-hour playtime', price: 59.99, stock: 40, image: 'https://picsum.photos/seed/sportearphones/300/200', category: 'Audio' },
        { name: 'Home Theater System 5.1', description: '5.1 surround sound system with 1000W total output and Dolby Digital', price: 599.99, stock: 5, image: 'https://picsum.photos/seed/hometheater51/300/200', category: 'Audio' },

        // Gaming
        { name: 'Gaming Mouse 16000 DPI', description: 'Optical gaming mouse with 16000 DPI, 8 programmable buttons and RGB lighting', price: 69.99, stock: 32, image: 'https://picsum.photos/seed/gamingmouse16k/300/200', category: 'Gaming' },
        { name: 'Mechanical Gaming Keyboard', description: 'Tenkeyless mechanical keyboard with Cherry MX switches and per-key RGB', price: 139.99, stock: 18, image: 'https://picsum.photos/seed/mechkbgaming/300/200', category: 'Gaming' },
        { name: 'Gaming Headset 7.1 Surround', description: 'Virtual 7.1 surround sound headset with noise-cancelling mic and memory foam', price: 99.99, stock: 22, image: 'https://picsum.photos/seed/gamingheadset71/300/200', category: 'Gaming' },
        { name: 'Game Controller Wireless', description: 'Wireless gamepad compatible with PC and consoles, 20-hour battery', price: 59.99, stock: 27, image: 'https://picsum.photos/seed/gamepadwireless/300/200', category: 'Gaming' },
        { name: 'Gaming Chair Ergonomic', description: 'Ergonomic racing-style gaming chair with lumbar support and 4D armrests', price: 349.99, stock: 8, image: 'https://picsum.photos/seed/gamingchair/300/200', category: 'Gaming' },
        { name: 'Gaming Desk RGB 140cm', description: '140cm gaming desk with RGB LED strip, cable management and cup holder', price: 229.99, stock: 6, image: 'https://picsum.photos/seed/gamingdesk140/300/200', category: 'Gaming' },
        { name: 'Capture Card 4K USB', description: '4K 60fps USB capture card for streaming and recording console gameplay', price: 149.99, stock: 14, image: 'https://picsum.photos/seed/capturecard4k/300/200', category: 'Gaming' },
        { name: 'Gaming Monitor 27" 240Hz', description: '27-inch Full HD IPS gaming monitor with 240Hz and G-Sync Compatible', price: 329.99, stock: 10, image: 'https://picsum.photos/seed/monitor240hz/300/200', category: 'Gaming' },
        { name: 'Racing Wheel & Pedals', description: 'Force feedback steering wheel with pedals set, compatible with PC and consoles', price: 279.99, stock: 7, image: 'https://picsum.photos/seed/racingwheel/300/200', category: 'Gaming' },
        { name: 'Gaming Mouse Pad XXL', description: 'Extra-large 900x400mm desk mat with stitched edges and non-slip rubber base', price: 34.99, stock: 50, image: 'https://picsum.photos/seed/mousepadxxl/300/200', category: 'Gaming' },

        // Office
        { name: 'Ergonomic Office Chair', description: 'Mesh back ergonomic chair with adjustable lumbar, headrest and armrests', price: 449.99, stock: 9, image: 'https://picsum.photos/seed/ergochair/300/200', category: 'Office' },
        { name: 'Standing Desk Motorized', description: 'Electric height-adjustable standing desk 120x60cm with memory presets', price: 599.99, stock: 5, image: 'https://picsum.photos/seed/standingdesk/300/200', category: 'Office' },
        { name: 'Laser Printer Monochrome', description: 'Wireless monochrome laser printer, 30ppm, duplex printing and 250-sheet tray', price: 199.99, stock: 13, image: 'https://picsum.photos/seed/laserprinter/300/200', category: 'Office' },
        { name: 'All-in-One Inkjet Printer', description: 'Colour inkjet printer with scan, copy, fax and wireless connectivity', price: 149.99, stock: 17, image: 'https://picsum.photos/seed/inkjetaio/300/200', category: 'Office' },
        { name: 'Document Scanner A4', description: 'Duplex A4 document scanner, 50ppm, ADF and USB 3.0', price: 249.99, stock: 11, image: 'https://picsum.photos/seed/docscannera4/300/200', category: 'Office' },
        { name: 'Desk Organiser with Wireless Charger', description: 'Multi-compartment desk organiser with integrated 15W wireless charging pad', price: 49.99, stock: 38, image: 'https://picsum.photos/seed/deskorganiser/300/200', category: 'Office' },
        { name: 'USB-C Docking Station 12-in-1', description: '12-in-1 USB-C dock with dual 4K HDMI, Ethernet, SD card and 100W PD', price: 129.99, stock: 20, image: 'https://picsum.photos/seed/dockstation12/300/200', category: 'Office' },
        { name: 'Webcam 4K with Ring Light', description: '4K autofocus webcam with built-in ring light and noise-cancelling dual mic', price: 129.99, stock: 16, image: 'https://picsum.photos/seed/webcam4kring/300/200', category: 'Office' },
        { name: 'Label Printer Thermal', description: 'Wireless thermal label printer for barcode, shipping and office labels', price: 79.99, stock: 24, image: 'https://picsum.photos/seed/labelprinter/300/200', category: 'Office' },
        { name: 'Monitor Arm Dual', description: 'Full-motion dual monitor arm for screens up to 32 inches, VESA 75/100', price: 89.99, stock: 19, image: 'https://picsum.photos/seed/monitorarmdual/300/200', category: 'Office' },

        // Mobile Accessories
        { name: 'MagSafe Wireless Charger 15W', description: '15W MagSafe-compatible wireless charger with alignment magnet ring', price: 39.99, stock: 45, image: 'https://picsum.photos/seed/magsafecharger/300/200', category: 'Mobile Accessories' },
        { name: 'Phone Case with Wallet', description: 'Premium leather folio case with card slots and kickstand for flagship phones', price: 29.99, stock: 60, image: 'https://picsum.photos/seed/phonecasewallet/300/200', category: 'Mobile Accessories' },
        { name: 'Screen Protector Tempered Glass', description: '9H tempered glass screen protector with oleophobic coating, 3-pack', price: 14.99, stock: 80, image: 'https://picsum.photos/seed/screenprotector/300/200', category: 'Mobile Accessories' },
        { name: 'Car Phone Mount MagSafe', description: 'Magnetic car vent mount with 360° rotation, MagSafe compatible', price: 34.99, stock: 42, image: 'https://picsum.photos/seed/carmount/300/200', category: 'Mobile Accessories' },
        { name: 'Power Bank 20000mAh', description: '20000mAh power bank with 65W USB-C PD, dual USB-A and LED display', price: 59.99, stock: 33, image: 'https://picsum.photos/seed/powerbank20k/300/200', category: 'Mobile Accessories' },
        { name: 'Fast Charger 65W GaN', description: '65W GaN wall charger with dual USB-C and one USB-A port', price: 44.99, stock: 55, image: 'https://picsum.photos/seed/gancharger65/300/200', category: 'Mobile Accessories' },
        { name: 'Braided USB-C Cable 2m', description: '2m nylon braided USB-C to USB-C cable supporting 100W charging and 40Gbps', price: 19.99, stock: 70, image: 'https://picsum.photos/seed/usbccable2m/300/200', category: 'Mobile Accessories' },
        { name: 'Selfie Stick Tripod Bluetooth', description: 'Extendable selfie stick with tripod stand and wireless shutter button', price: 24.99, stock: 48, image: 'https://picsum.photos/seed/selfiestick/300/200', category: 'Mobile Accessories' },
        { name: 'Phone Grip & Stand Ring', description: 'Rotating 360° finger ring grip and kickstand, compatible with MagSafe', price: 12.99, stock: 90, image: 'https://picsum.photos/seed/phonegripring/300/200', category: 'Mobile Accessories' },
        { name: 'Portable Phone Sanitizer UV', description: 'UV-C phone sanitizer box that kills 99.9% of bacteria in 10 minutes', price: 49.99, stock: 26, image: 'https://picsum.photos/seed/uvsanitizer/300/200', category: 'Mobile Accessories' },

        // Networking
        { name: 'Wi-Fi 6E Mesh Router 3-Pack', description: 'Tri-band Wi-Fi 6E mesh system covering up to 600m² with app management', price: 449.99, stock: 8, image: 'https://picsum.photos/seed/meshrouter6e/300/200', category: 'Networking' },
        { name: 'Gigabit 8-Port Network Switch', description: 'Unmanaged 8-port gigabit Ethernet switch with plug-and-play setup', price: 39.99, stock: 30, image: 'https://picsum.photos/seed/switch8port/300/200', category: 'Networking' },
        { name: 'Wi-Fi Range Extender', description: 'Dual-band Wi-Fi extender boosting signal up to 150m², easy WPS setup', price: 49.99, stock: 28, image: 'https://picsum.photos/seed/wifiextender/300/200', category: 'Networking' },
        { name: 'USB Wi-Fi Adapter AC1300', description: 'Dual-band USB 3.0 Wi-Fi adapter AC1300 with external antenna', price: 29.99, stock: 35, image: 'https://picsum.photos/seed/usbwifiadapter/300/200', category: 'Networking' },
        { name: 'PoE+ Network Switch 16-Port', description: '16-port managed PoE+ switch with 230W budget and VLAN support', price: 299.99, stock: 6, image: 'https://picsum.photos/seed/poeswitch16/300/200', category: 'Networking' },
        { name: 'Network Attached Storage 4-Bay', description: '4-bay NAS enclosure supporting RAID 0/1/5/6, Plex media server ready', price: 399.99, stock: 7, image: 'https://picsum.photos/seed/nas4bay/300/200', category: 'Networking' },
        { name: 'Powerline Adapter Kit 1200Mbps', description: '1200Mbps powerline adapter pair with passthrough socket and gigabit port', price: 69.99, stock: 20, image: 'https://picsum.photos/seed/powerlinekit/300/200', category: 'Networking' },
        { name: 'Travel Router Wi-Fi 6', description: 'Pocket-sized Wi-Fi 6 travel router with VPN client and USB tethering', price: 79.99, stock: 22, image: 'https://picsum.photos/seed/travelrouter/300/200', category: 'Networking' },
        { name: 'CAT8 Ethernet Cable 10m', description: '10m CAT8 flat ethernet cable supporting 40Gbps and 2000MHz bandwidth', price: 24.99, stock: 45, image: 'https://picsum.photos/seed/cat8cable10m/300/200', category: 'Networking' },
        { name: 'Wireless Access Point Ceiling', description: 'Ceiling-mount Wi-Fi 6 access point with PoE, 574Mbps and 80-device support', price: 129.99, stock: 11, image: 'https://picsum.photos/seed/ceilingap/300/200', category: 'Networking' },

        // Photography
        { name: 'Mirrorless Camera 24MP', description: '24MP APS-C mirrorless camera with 4K video, IBIS and kit 18-55mm lens', price: 849.99, stock: 9, image: 'https://picsum.photos/seed/mirrorless24mp/300/200', category: 'Photography' },
        { name: 'Camera Drone 4K Foldable', description: 'Foldable 4K GPS drone with 3-axis gimbal, 30-min flight and obstacle avoidance', price: 699.99, stock: 6, image: 'https://picsum.photos/seed/drone4k/300/200', category: 'Photography' },
        { name: 'Camera Tripod Carbon Fibre', description: '5-section carbon fibre tripod with ball head, max load 8kg and 150cm height', price: 179.99, stock: 14, image: 'https://picsum.photos/seed/tripodcarbon/300/200', category: 'Photography' },
        { name: 'LED Ring Light 18" with Stand', description: '18-inch bi-colour LED ring light with 2m stand and phone holder', price: 89.99, stock: 23, image: 'https://picsum.photos/seed/ringlight18/300/200', category: 'Photography' },
        { name: 'Camera Backpack 30L', description: 'Weather-resistant 30L camera backpack fitting DSLR, 3 lenses and laptop', price: 99.99, stock: 18, image: 'https://picsum.photos/seed/camerabackpack/300/200', category: 'Photography' },
        { name: 'Action Camera 4K 60fps', description: 'Waterproof 4K 60fps action camera with EIS, touch screen and mounting kit', price: 249.99, stock: 15, image: 'https://picsum.photos/seed/actioncam4k/300/200', category: 'Photography' },
        { name: 'Prime Lens 50mm f/1.8', description: 'Fast 50mm f/1.8 prime lens for Sony E-mount with autofocus', price: 199.99, stock: 12, image: 'https://picsum.photos/seed/lens50mm/300/200', category: 'Photography' },
        { name: 'Wireless Flash Trigger Kit', description: '2.4GHz wireless flash trigger and receiver set, TTL and HSS support', price: 69.99, stock: 17, image: 'https://picsum.photos/seed/flashtrigger/300/200', category: 'Photography' },
        { name: 'Portable Photo Printer', description: 'Pocket-size Zink photo printer, prints 2x3" sticker photos via Bluetooth', price: 79.99, stock: 27, image: 'https://picsum.photos/seed/photoprinter/300/200', category: 'Photography' },
        { name: 'ND Filter Set 67mm', description: 'Graduated ND2/ND4/ND8/ND16 filter set in 67mm with magnetic adapter ring', price: 49.99, stock: 20, image: 'https://picsum.photos/seed/ndfilter67/300/200', category: 'Photography' },

        // Smart Home
        { name: 'Smart Thermostat Learning', description: 'Learning smart thermostat with app control, scheduling and energy reports', price: 179.99, stock: 13, image: 'https://picsum.photos/seed/smartthermostat/300/200', category: 'Smart Home' },
        { name: 'Video Doorbell 2K', description: '2K HDR video doorbell with two-way audio, motion zones and cloud storage', price: 149.99, stock: 18, image: 'https://picsum.photos/seed/videodoorbell/300/200', category: 'Smart Home' },
        { name: 'Smart Lock Fingerprint', description: 'Wi-Fi smart lock with fingerprint, PIN, card, key and app access', price: 199.99, stock: 10, image: 'https://picsum.photos/seed/smartlock/300/200', category: 'Smart Home' },
        { name: 'Indoor Security Camera 2K', description: '2K pan-tilt indoor camera with 360° coverage, AI motion detection and night vision', price: 49.99, stock: 35, image: 'https://picsum.photos/seed/indoorcamera/300/200', category: 'Smart Home' },
        { name: 'Smart Plug with Energy Monitor', description: 'Wi-Fi smart plug with real-time energy monitoring, schedules and voice control', price: 19.99, stock: 60, image: 'https://picsum.photos/seed/smartplug/300/200', category: 'Smart Home' },
        { name: 'Smart LED Bulb RGBW E27', description: 'RGBW 9W E27 smart bulb, 16M colours, tunable white and voice control', price: 14.99, stock: 75, image: 'https://picsum.photos/seed/smartbulb/300/200', category: 'Smart Home' },
        { name: 'Smart LED Strip 5m', description: '5m RGBIC smart LED strip with music sync, segmented control and Matter support', price: 44.99, stock: 40, image: 'https://picsum.photos/seed/ledstrip5m/300/200', category: 'Smart Home' },
        { name: 'Smart Air Purifier', description: 'Smart air purifier with HEPA H13 filter, auto mode, PM2.5 sensor and app control', price: 229.99, stock: 9, image: 'https://picsum.photos/seed/airpurifier/300/200', category: 'Smart Home' },
        { name: 'Robot Vacuum & Mop', description: 'LiDAR robot vacuum and mop with auto-empty base, 5000Pa suction and mapping', price: 499.99, stock: 7, image: 'https://picsum.photos/seed/robotvacuum/300/200', category: 'Smart Home' },
        { name: 'Smart Hub Matter Bridge', description: 'Matter-compatible smart home hub bridging Zigbee, Z-Wave and Wi-Fi devices', price: 89.99, stock: 16, image: 'https://picsum.photos/seed/smarthub/300/200', category: 'Smart Home' },

        // Wearables
        { name: 'Smartwatch AMOLED 1.4"', description: '1.4" AMOLED smartwatch with GPS, heart rate, SpO2 and 14-day battery', price: 199.99, stock: 20, image: 'https://picsum.photos/seed/smartwatch14/300/200', category: 'Wearables' },
        { name: 'Fitness Tracker Slim', description: 'Slim fitness band with sleep tracking, 20 sport modes and 10-day battery', price: 59.99, stock: 38, image: 'https://picsum.photos/seed/fitnesstracker/300/200', category: 'Wearables' },
        { name: 'Smart Ring Health Monitor', description: 'Titanium smart ring tracking HRV, sleep stages, body temperature and activity', price: 299.99, stock: 11, image: 'https://picsum.photos/seed/smartring/300/200', category: 'Wearables' },
        { name: 'GPS Running Watch', description: 'Multi-band GPS running watch with training load, maps and 20-day battery', price: 449.99, stock: 8, image: 'https://picsum.photos/seed/gpsrunwatch/300/200', category: 'Wearables' },
        { name: 'AR Smart Glasses', description: 'Open-ear smart glasses with directional speakers, UV lenses and voice assistant', price: 249.99, stock: 10, image: 'https://picsum.photos/seed/arglasses/300/200', category: 'Wearables' },
        { name: 'ECG Smartwatch Medical', description: 'FDA-cleared ECG smartwatch with afib detection, fall detection and SOS calling', price: 349.99, stock: 9, image: 'https://picsum.photos/seed/ecgwatch/300/200', category: 'Wearables' },
        { name: 'Kids GPS Tracker Watch', description: "Children's GPS smartwatch with two-way calling, safe zone alerts and SOS button", price: 89.99, stock: 24, image: 'https://picsum.photos/seed/kidsgpswatch/300/200', category: 'Wearables' },
        { name: 'Posture Corrector Smart', description: 'Smart posture sensor worn on upper back, vibrates gently to remind correct posture', price: 79.99, stock: 17, image: 'https://picsum.photos/seed/posturecorrector/300/200', category: 'Wearables' },
        { name: 'Wireless Charging Watch Band', description: 'Replacement silicone watch band with built-in wireless charging receiver', price: 29.99, stock: 42, image: 'https://picsum.photos/seed/watchband/300/200', category: 'Wearables' },
        { name: 'Smart Glasses Polarised', description: 'Polarised sunglasses with open-ear audio, tap controls and 6-hour playtime', price: 169.99, stock: 15, image: 'https://picsum.photos/seed/smartglassespol/300/200', category: 'Wearables' },

        // Storage
        { name: 'External SSD 2TB USB-C', description: '2TB portable SSD with USB 3.2 Gen2 delivering up to 1050MB/s read speed', price: 179.99, stock: 22, image: 'https://picsum.photos/seed/externalssd2tb/300/200', category: 'Storage' },
        { name: 'Internal SSD NVMe M.2 1TB', description: 'PCIe 4.0 NVMe M.2 SSD with 7000/6500 MB/s read/write speeds', price: 99.99, stock: 30, image: 'https://picsum.photos/seed/nvmessd1tb/300/200', category: 'Storage' },
        { name: 'USB Flash Drive 256GB', description: 'Compact USB 3.2 flash drive, 256GB with 200MB/s read speed and metal casing', price: 29.99, stock: 55, image: 'https://picsum.photos/seed/usb256gb/300/200', category: 'Storage' },
        { name: 'microSD Card 512GB UHS-II', description: '512GB UHS-II microSD card rated A2 V60, 280MB/s read for 4K recording', price: 89.99, stock: 27, image: 'https://picsum.photos/seed/microsd512/300/200', category: 'Storage' },
        { name: 'HDD External 8TB Desktop', description: '8TB USB 3.0 desktop hard drive for backup and archiving with included PSU', price: 149.99, stock: 14, image: 'https://picsum.photos/seed/hdd8tb/300/200', category: 'Storage' },
        { name: 'M.2 NVMe Enclosure USB4', description: 'USB4 40Gbps M.2 NVMe enclosure with tool-free installation and aluminium body', price: 44.99, stock: 32, image: 'https://picsum.photos/seed/nvmeenclosure/300/200', category: 'Storage' },
        { name: 'Dual-Bay RAID Docking Station', description: 'Dual-bay USB-C RAID docking station supporting RAID 0/1/JBOD for 2.5"/3.5" drives', price: 79.99, stock: 12, image: 'https://picsum.photos/seed/raiddock/300/200', category: 'Storage' },
        { name: 'SD Card Reader USB-C 7-in-1', description: '7-in-1 USB-C card reader supporting SD, microSD, CF, MS and XQD cards', price: 34.99, stock: 40, image: 'https://picsum.photos/seed/sdreader7in1/300/200', category: 'Storage' },
        { name: 'Network Storage Drive 4TB', description: '4TB personal cloud NAS drive with built-in Wi-Fi, DLNA and remote access', price: 129.99, stock: 10, image: 'https://picsum.photos/seed/networkdrive4tb/300/200', category: 'Storage' },
        { name: 'CFexpress Type B Card 256GB', description: '256GB CFexpress Type B card with 1700MB/s read for high-speed burst photography', price: 199.99, stock: 8, image: 'https://picsum.photos/seed/cfexpress256/300/200', category: 'Storage' },
      ]);
    }
  }

  async findAll(
    category?: string,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    let where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[];

    if (search) {
      const searchClauses = [
        { name: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      ];
      where = category
        ? searchClauses.map(c => ({ ...c, category }))
        : searchClauses;
    } else {
      where = category ? { category } : {};
    }

    const [data, total] = await this.productRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Product ${id} not found`);
  }

  async decreaseStock(id: number, quantity: number): Promise<void> {
    const result = await this.productRepo
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id AND stock >= :quantity', { id, quantity })
      .execute();

    if (!result.affected) {
      // Either the product doesn't exist or stock was insufficient.
      // findOne will throw NotFoundException if missing; otherwise report low stock.
      const product = await this.findOne(id);
      throw new BadRequestException(
        `Only ${product.stock} unit(s) available for "${product.name}"`,
      );
    }
  }

  async increaseStock(id: number, quantity: number): Promise<void> {
    await this.findOne(id); // throws NotFoundException if product doesn't exist
    await this.productRepo
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => `stock + ${quantity}` })
      .where('id = :id', { id })
      .execute();
  }
}
