#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use DBI;
use JSON;
use Data::Dumper qw(Dumper);

my %hash;
my $hash;
my $json;
my $useacomma;
my %rhash;
my $rhash;



my $q = new CGI;
print $q->header(
  -access_control_allow_origin => '*',
);



my $dbh = DBI->connect('dbi:Pg:dbname=classic;host=localhost','derek','dtDerek',{AutoCommit=>1,RaiseError=>1,PrintError=>0});

my $sth = $dbh->prepare("SELECT * FROM items WHERE 1=0");
$sth->execute();
my $fields = $sth->{NAME};

print "{\n\"items\" : [\n";
$useacomma = 0;
$sth = $dbh->prepare("SELECT * FROM items");
$sth->execute();

while (my @row = $sth->fetchrow_array) {  # retrieve one row at a time
  @hash{@$fields} = @row;
  $json = encode_json \%hash;
  if ($useacomma) {
    print ",\n";
  } else {
    $useacomma = 1;
  };
  print $json;
}
print "\n],\n\n";






$sth = $dbh->prepare("SELECT * FROM rooms WHERE 1=0");
$sth->execute();
$fields = $sth->{NAME};

print "\n\"rooms\" : [\n";
$useacomma = 0;
$sth = $dbh->prepare("SELECT * FROM rooms");
$sth->execute();

while (my @row = $sth->fetchrow_array) {  # retrieve one row at a time
  @rhash{@$fields} = @row;
  $json = encode_json \%rhash;
  if ($useacomma) {
    print ",\n";
  } else {
    $useacomma = 1;
  };
  print $json;
}
print "\n],\n\n";







$sth = $dbh->prepare("SELECT * FROM snippets") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"snippets\" : ";
delete $hash{$_} for (keys %hash);
while( my( $snippetID, $snippet ) = $sth->fetchrow_array() ) {
  $hash{ $snippetID } = $snippet;
}
$json = encode_json \%hash;
print $json,",\n\n";






$sth = $dbh->prepare("SELECT * FROM lists") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"lists\" : ";
delete $hash{$_} for (keys %hash);
while( my( $listsID, $lists ) = $sth->fetchrow_array() ) {
  $hash{ $listsID } = $lists;
}
$json = encode_json \%hash;
print $json,",\n\n";






$sth = $dbh->prepare("SELECT hlcommand, template FROM templates") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"templates\" : ";
delete $hash{$_} for (keys %hash);
while( my( $hlcommand, $template ) = $sth->fetchrow_array() ) {
  $hash{ $hlcommand } = $template;
}
$json = encode_json \%hash;
print $json,",\n\n";







$sth = $dbh->prepare("SELECT command, token FROM commands") or die +DBI->errstr;
$sth->execute() or die DBI->errstr;
print "\n\"commands\" : ";
delete $hash{$_} for (keys %hash);
while( my( $command, $token ) = $sth->fetchrow_array() ) {
  $hash{ $command } = $token;
}
$json = encode_json \%hash;
print $json,"\n}\n\n";
