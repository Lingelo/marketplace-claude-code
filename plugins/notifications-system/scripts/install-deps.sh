#!/bin/bash

# Install dependencies for Claude Code notifications plugin (Linux only)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔔 Claude Code Notifications - Installation des dépendances"
echo ""

# Check if running on Linux
if [[ "$(uname)" != "Linux" ]]; then
  echo -e "${YELLOW}Ce script est uniquement pour Linux.${NC}"
  echo "Sur macOS et Windows, les dépendances sont natives."
  exit 0
fi

# Detect package manager and install
install_packages() {
  local notify_pkg="$1"
  local sound_pkg="$2"
  local install_cmd="$3"

  echo "📦 Installation de: $notify_pkg $sound_pkg"
  echo ""

  if $install_cmd $notify_pkg $sound_pkg; then
    echo ""
    echo -e "${GREEN}✅ Installation terminée${NC}"
  else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
  fi
}

# Detect distro and install
if command -v apt-get &> /dev/null; then
  # Debian/Ubuntu
  echo "Détecté: Debian/Ubuntu"
  install_packages "libnotify-bin" "pulseaudio-utils" "sudo apt-get install -y"

elif command -v dnf &> /dev/null; then
  # Fedora/RHEL
  echo "Détecté: Fedora/RHEL"
  install_packages "libnotify" "pulseaudio-utils" "sudo dnf install -y"

elif command -v pacman &> /dev/null; then
  # Arch Linux
  echo "Détecté: Arch Linux"
  install_packages "libnotify" "pulseaudio" "sudo pacman -S --noconfirm"

elif command -v zypper &> /dev/null; then
  # openSUSE
  echo "Détecté: openSUSE"
  install_packages "libnotify-tools" "pulseaudio-utils" "sudo zypper install -y"

else
  echo -e "${RED}❌ Gestionnaire de paquets non reconnu${NC}"
  echo ""
  echo "Installez manuellement:"
  echo "  - libnotify (pour notify-send)"
  echo "  - pulseaudio-utils (pour paplay)"
  exit 1
fi

echo ""
echo "🎉 Le plugin notifications est prêt à fonctionner."