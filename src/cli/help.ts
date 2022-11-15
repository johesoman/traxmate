const help = `
 (_  _)(  _ \\ / _\\ ( \\/ )( \\/ ) / _\\(_  _)(  __)
   )(   )   //    \\ )  ( / \\/ \\/    \\ )(   ) _)
  (__) (__\\_)\\_/\\_/(_/\\_)\\_)(_/\\_/\\_/(__) (____)

Usage:
  traxmate --help
  traxmate <command> [options...]
  traxmate extract --source <path> --destination <path>

Global options:
  --help          View this information.
  --config <path> Available for all commands. Provide The path to your
                  .toml config file. If this option is set, all other
                  options are ignored.

Commands:
  extract
    Description:
      Extracts all of the tracks from the source directory and moves
      them to the destination directory.
    Options:
      --source      <path> The path to the source directory.
      --destination <path> The path to the destination directory.
`;

export default help;
