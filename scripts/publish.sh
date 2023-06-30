PATH_TO_FOLDERS="$PWD/dist/packages"

# Iterate over each folder in the path
for dir in "$PATH_TO_FOLDERS"/*; do
  if [ -d "$dir" ]; then
    cd "$dir"
    echo "Publishing in folder: $dir"
    npm publish --access public
  fi
done
