#!/usr/bin/perl -w
use strict;
use warnings;

use HTTP::Daemon;

my $server = HTTP::Daemon->new(Timeout => 60, Localport => 8989);
print "Dummy web server for diagnostics\n";

while (my $client = $server->accept) {
  CONNECTION:
    while (my $answer = $client->get_request) {
      print $answer->as_string;
      $client->autoflush;
     RESPONSE:
      while (<STDIN>) {
        last RESPONSE   if $_ eq ".\n";
        last CONNECTION if $_ eq "..\n";
        print $client $_;
      }
      print "\nEOF\n";
    }
    print "CLOSE: ", $client->reason, "\n";
    $client->close;
    undef $client;
}
