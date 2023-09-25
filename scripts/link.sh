# A script to easily link all the SDK packages
# Run `npm run link:all` after running `npm run build:all`
# The script will automatically link/unlink the packages in the dist folder
# At the end of the script, copy the `npm link ...` command and run it in your external project
#
# Warning: make sure that the node version you use when you run `npm run build:all` && `npm run link:all` is the same as the one you use in your external project


PATH_TO_FOLDERS="$PWD/dist/packages"
CONCATENATION=""

generateLinkCommand() {
  local EXCLUDE_PACKAGE="$1"
  local LINK_COMMAND="npm link"
  for PACKAGE in $CONCATENATION; do
    if [ "$PACKAGE" != "$EXCLUDE_PACKAGE" ]; then
      LINK_COMMAND="${LINK_COMMAND} ${PACKAGE}"
    fi
  done
  echo "[in $EXCLUDE_PACKAGE] -> $LINK_COMMAND"
  $LINK_COMMAND
}


# Iterate over each folder in the path
for dir in "$PATH_TO_FOLDERS"/*; do
  if [ -d "$dir" ]; then
    cd "$dir"

    # Extract package name from package.json and append it to CONCATENATION
    PACKAGE_NAME=$(grep '"name":' package.json | sed 's/.*: "\(.*\)",/\1/')

    npm unlink ${PACKAGE_NAME}
    npm link

    if [ ! -z "$PACKAGE_NAME" ]; then
      CONCATENATION="${CONCATENATION} ${PACKAGE_NAME}"
    fi
  fi
done



for dir in "$PATH_TO_FOLDERS"/*; do
  if [ -d "$dir" ]; then
    cd "$dir"

    PACKAGE_NAME=$(grep '"name":' package.json | sed 's/.*: "\(.*\)",/\1/')
    generateLinkCommand $PACKAGE_NAME

  fi
done

echo ""
echo "✅ OK"
echo ""
echo "################"
echo "Run this command in your external project"
echo ""
echo "npm link${CONCATENATION}"
echo ""
echo "################"
